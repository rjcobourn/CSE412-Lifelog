export default function Home() {
  return (
    <div class="login-page-container">
      <div class="login-ui">
        <form action="/submit-your-login-form" method="post">
          <div class="form-group">
            <label class="primary-color display-block" for="username">
              Username:
            </label>
            <input
              class="login-input"
              type="text"
              id="username"
              name="username"
              required
            />
          </div>
          <div class="form-group">
            <label class="primary-color display-block" for="password">
              Password:
            </label>
            <input
              class="login-input"
              type="password"
              id="password"
              name="password"
              required
            />
          </div>
          <button class="login-page-buttons" type="submit">
            Login
          </button>
          <button class="login-page-buttons" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
