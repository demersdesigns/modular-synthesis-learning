import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function login(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = cookies()
    cookieStore.set('admin_session', '1', {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })
    redirect('/admin')
  }
  redirect('/admin/login?error=1')
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="login-page">
      <form className="login-form" action={login}>
        <div className="login-title">Admin</div>
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          className="form-input"
          autoComplete="current-password"
          autoFocus
        />
        <button type="submit" className="btn-primary btn-full">
          Enter
        </button>
        {searchParams.error && <div className="login-error">— incorrect —</div>}
      </form>
    </div>
  )
}
