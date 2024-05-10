/** @jsxImportSource frog/jsx */
import { Frog } from "frog";
import { neynar } from "frog/hubs";
import { kv } from "@vercel/kv";
import { Button, TextInput } from "frog";
import {
  Box,
  Columns,
  Column,
  Divider,
  Heading,
  HStack,
  Icon,
  Image,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  vars,
} from "@/app/components/systemComponents";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import {
  APIResponse as UserProfileAPIResponse,
  UserProfile,
} from "@/types/UserProfile";

if (!process.env.NEYNAR_HUB) {
  throw new Error("NEYNAR_HUB environment variable is not set");
}

const app = new Frog({
  ui: { vars },
  assetsPath: "/",
  basePath: "/api",
  hub: neynar({ apiKey: process.env.NEYNAR_API || "NEYNAR_FROG_FM" }),
});

app.frame("/curate-frame", (c) => {
  // save the user's review to the database
  const { inputText, frameData } = c;
  const { castId = { fid: -1, hash: 0 }, fid = -1 } = frameData ?? {};
  const { fid: frameFid, hash } = castId;
  if (frameFid === -1) {
    return c.res({
      image: <div>Invalid Cast ID</div>,
    });
  } else if (hash === 0) {
    return c.res({
      image: <div>Invalid Cast Hash</div>,
    });
  }
  return fetchUserProfiles(fid)
    .then((userProfile) => {
      const { users } = userProfile;
      const { username, pfp_url: pfpUrl } = users[0];
      if (!inputText) {
        return c.res({
          image: (
            <VStack>
              <Heading>Curate {username}</Heading>
              <Text>
                Would you like to add some commentary on this artwork before
                curating?
              </Text>
            </VStack>
          ),
          intents: [
            <TextInput placeholder="write your thoughts here" />,
            <Button>Submit</Button>,
          ],
        });
      }
      return kv
        .incr("curation_id")
        .then((id) => {
          const curationKey = `curation:${id}`;
          return kv.hset(curationKey, {
            text: inputText,
            castId: hash,
            frameFid,
            fid,
            username,
            pfpUrl,
          });
        })
        .then(() => {
          return c.res({
            image: (
              <VStack>
                <Heading>You Curated {username}</Heading>
                <Text>Thanks for your curation!</Text>
              </VStack>
            ),
          });
        });
    })
    .catch((error) => {
      console.error("Error handling curate-frame:", error);
      return c.res({
        image: <div>Error processing your request</div>,
      });
    });
});

app.frame("/curate-test", (c) => {
  return c.res({
    image: (
      <VStack>
        <Heading>Curate</Heading>
        <Text>
          Would you like to add some commentary on this artwork before curating?
        </Text>
      </VStack>
    ),
    intents: (
      <Button.AddCastAction action="/add-curate-action">
        banana
      </Button.AddCastAction>
    ),
  });
});

app.frame("/install-curate", (c) => {
  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
  return c.res({
    image: (
      <VStack>
        <Heading>Install the Curate action!</Heading>
      </VStack>
    ),
    intents: [
      <Button.AddCastAction action="/add-curate-action">
        Add Curate Cast Action
      </Button.AddCastAction>,
    ],
  });
});

app.castAction(
  "/add-curate-action",
  (c) => {
    console.log(
      `Cast Action to ${JSON.stringify(c.actionData.castId)} from ${
        c.actionData.fid
      }`
    );
    return c.res({ type: "frame", path: "/curate-frame" });
  },
  { name: "Curate", icon: "smiley" }
);

devtools(app, { serveStatic });

async function fetchUserProfiles(fid: number): Promise<UserProfileAPIResponse> {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API || "NEYNAR_FROG_FM",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data: UserProfileAPIResponse = await response.json(); // Parse JSON and assert the type
  console.log("fetchUserProfiles response", data);
  return data;
}

export const GET = handle(app);
export const POST = handle(app);
