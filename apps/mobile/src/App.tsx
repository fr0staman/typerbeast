import "@/ui/css/globals.css";

import { Home } from "@/ui/components/Home";
import { GluestackUIProvider } from "@/ui/providers/gluestack";

const App = () => {
  return (
    <GluestackUIProvider>
      <Home />
    </GluestackUIProvider>
  );
};
export default App;
