import "@/ui/css/globals.css";

import { GluestackUIProvider } from "@/ui/providers/gluestack";
import { AppNavContainer } from "@/app/providers/navigation";
import { AppStack } from "@/app/navigation";
import { QueryProvider } from "@/app/providers/query";
import { Bootstrap } from "./Bootstrap";

const App = () => {
  return (
    <GluestackUIProvider>
      <QueryProvider>
        <Bootstrap>
          <AppNavContainer>
            <AppStack />
          </AppNavContainer>
        </Bootstrap>
      </QueryProvider>
    </GluestackUIProvider>
  );
};

export default App;
