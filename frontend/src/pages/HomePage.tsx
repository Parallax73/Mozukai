import { Box } from '@mui/material';
import RotatingText from '../components/RotatingText'
import { LayoutGroup, motion } from 'framer-motion';

export default function HomePage() {

  const words = [
    "Natureza",
    "Arte",
    "Vida",
  ];

  return (
    <Box position="relative" overflow="hidden">
          <div className="rotating-text-demo">
            <LayoutGroup>
              <motion.p className="rotating-text-ptag" layout>
                <motion.span
                  className="pt-0.5 sm:pt-1 md:pt-2"
                  layout
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                >
                  Creative{" "}
                </motion.span>
                <RotatingText
                  texts={words}
                  mainClassName="rotating-text-main"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="rotating-text-split"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </motion.p>
            </LayoutGroup>
          </div>
        </Box>
  );
}