import { Box } from '@mui/material';
import RotatingText from '../components/RotatingText';
import { LayoutGroup, motion } from 'framer-motion';

export default function HomePage() {
  const words = ["Natureza", "Arte", "Vida", "Mozukai"];

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start', 
      alignItems: 'center',
      pt: '15vh',
      fontSize: '4rem'
    }}>
      <div className="rotating-text-demo">
        <LayoutGroup>
          <motion.p className="rotating-text-ptag" layout>
            <motion.span
              layout
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              Bonsai é
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
              rotationInterval={3000}
            />
          </motion.p>
        </LayoutGroup>
      </div>
    </Box>
  );
}