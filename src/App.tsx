import { RouterProvider } from "@tanstack/react-router"
import { App as AntDesign, ConfigProvider } from "antd"
import { checkAuthentication } from "apis/auth.api"
import Locales from "components/Locales"
import { useEffect } from "react"
import appRouter from "router"
import { useAuthStore } from "stores/auth.store"
import { themeConfig } from "theme"

function App() {

  const setAccount = useAuthStore((s) => s.setAccount)
  const logout = useAuthStore((s) => s.logout)
  const accessToken = localStorage.getItem('accessToken')

  useEffect(() => {
    if (!accessToken) {
      setAccount(null)
      return
    }

    const checkAccountAuthentication = async () => {
      try {
        const response = await checkAuthentication()
        setAccount(response.data)
      } catch (error) {
        console.error('Authentication check failed:', error)
        logout()
      }
    }

    checkAccountAuthentication()
  }, [logout, setAccount, accessToken])


  return (
    <Locales>
      <ConfigProvider theme={themeConfig}>
        <AntDesign>
          <RouterProvider router={appRouter} />
        </AntDesign>
      </ConfigProvider>
    </Locales>
  )
}

export default App

