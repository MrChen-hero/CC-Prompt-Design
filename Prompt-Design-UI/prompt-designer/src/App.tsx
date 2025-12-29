import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { Home } from "@/pages/Home"
import { Create } from "@/pages/Create"
import { Library } from "@/pages/Library"
import { Convert } from "@/pages/Convert"
import { Settings } from "@/pages/Settings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="library" element={<Library />} />
          <Route path="convert" element={<Convert />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
