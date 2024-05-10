import { createSystem } from "frog/ui";

export const {
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
} = createSystem({
  colors: {
    text: '#000000',
    background: '#ffffff',
    blue: '#0070f3',
    green: '#00ff00',
    red: '#ff0000',
    orange: '#ffaa00',
  },
  fonts: {
    default: [
      {
        name: 'Open Sans',
        source: 'google',
        weight: 400,
      },
      {
        name: 'Open Sans',
        source: 'google',
        weight: 600,
      },
    ],
    madimi: [
      {
        name: 'Madimi One',
        source: 'google',
      },
    ],
  }, 
  fontSizes: {
    small: 0.01,
    medium: 0.02,
    large: 0.03,
  },
});
