import "@/ui/css/globals.css";

import { GluestackUIProvider } from "@/ui/providers/gluestack";
import { AppNavContainer } from "@/app/providers/navigation";
import { AppStack } from "@/app/navigation";

const App = () => {
  return (
    <GluestackUIProvider>
      <AppNavContainer>
        <AppStack />
      </AppNavContainer>
    </GluestackUIProvider>
  );
};
export default App;
