import { Link } from '@tanstack/react-router'
import { App, Button, Card, Form, Input } from 'antd'
import { HttpStatusCode } from 'axios'
import { useSignin } from 'hooks'
import { FormattedMessage } from 'react-intl'
import "./Login.scss"

const Login = () => {

    const [loginForm] = Form.useForm()
    const signinMutation = useSignin()

    const { notification } = App.useApp()

    const handleLogin = (values: any) => {
        signinMutation.mutate(values, {
            onSuccess: (response) => {
                if (response.status === HttpStatusCode.Ok) {
                    const { accessToken, refreshToken } = response.data
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', refreshToken)
                    notification.success({
                        title: <FormattedMessage id="login.message.success" />
                    })
                } else {
                    notification.error({
                        title: <FormattedMessage id={response.message} />
                    })
                }
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || error.message
                notification.error({
                    title: <FormattedMessage id={errorMessage} />
                })
            },
        })
    }

    return (
        <Card title={<FormattedMessage id='login.form.title' />} className="login-card min-w-360">
            <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
                <Form.Item
                    label={<FormattedMessage id="login.form.username" />}
                    name="username"
                    rules={[
                        { required: true, message: <FormattedMessage id="message.account.username.is-required" /> },
                        { type: 'string', message: <FormattedMessage id="message.account.username.must-is-string" /> },
                        { min: 2, message: <FormattedMessage id="message.account.username.min-length-is-2" /> },
                        { max: 32, message: <FormattedMessage id="message.account.username.max-length-is-32" /> },
                    ]}
                >
                    <Input size='large' />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="login.form.password" />}
                    name="password"
                    rules={[
                        { required: true, message: <FormattedMessage id="message.account.password.is-required" /> },
                        { min: 6, message: <FormattedMessage id="message.account.password.min-length-is-6" /> },
                    ]}
                >
                    <Input.Password size="large" />
                </Form.Item>
                <Form.Item noStyle>
                    <div style={{ textAlign: 'right', marginTop: -8 }}>
                        <Link to={"/auth/forgot-password"}>
                            <FormattedMessage id="login.form.forgot-password" />
                        </Link>
                    </div>
                </Form.Item>

                <Button loading={signinMutation.isPending} className='mt-40' size='large' type="primary" htmlType="submit" block>
                    <FormattedMessage id="login.form.btn.login" />
                </Button>
            </Form>
        </Card >
    )
}

export default Login
