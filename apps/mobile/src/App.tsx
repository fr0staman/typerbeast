import "@/ui/css/globals.css";

import { GluestackUIProvider } from "@/ui/providers/gluestack";
import { AppNavContainer } from "@/app/providers/navigation";
import { AppStack } from "@/app/navigation";
import { Bootstrap } from "./Bootstrap";

const App = () => {
  return (
    <GluestackUIProvider>
      <Bootstrap>
        <AppNavContainer>
          <AppStack />
        </AppNavContainer>
      </Bootstrap>
    </GluestackUIProvider>
  );
};

export default App;
