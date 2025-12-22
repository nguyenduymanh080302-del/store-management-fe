import { ConfigProvider, Spin } from "antd"
import Locales from "components/Locales"
import { Suspense } from "react"
import { themeConfig } from "./theme"
import { RouterProvider } from "@tanstack/react-router"
import appRouter from "router"

function App() {

  return (
    <Locales>
      <ConfigProvider theme={themeConfig}>
        <Suspense fallback={<Spin fullscreen />}>
          <RouterProvider router={appRouter} />
        </Suspense>
      </ConfigProvider>
    </Locales>
  )
}

export default App
