import { App as AntdApp, ConfigProvider, Spin } from "antd"
import Locales from "components/Locales"
import { Suspense } from "react"
import { themeConfig } from "./theme"
import { RouterProvider } from "@tanstack/react-router"
import appRouter from "router"

function App() {

  return (
    <Locales>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          <Suspense fallback={<Spin fullscreen />}>
            <RouterProvider router={appRouter} />
          </Suspense>
        </AntdApp>
      </ConfigProvider>
    </Locales>
  )
}

export default App
