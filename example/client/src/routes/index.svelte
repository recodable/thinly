<script>
  import client from '../client'

  let formData = { username: '', password: '' }

  function submit() {
    return client.loginPost(formData)
  }
</script>

<!-- <p style="color: red;">Invalid password</p> -->
<form on:submit|preventDefault={submit}>
  <input bind:value={formData.username} type="text" name="username" />
  <input bind:value={formData.password} type="password" name="password" />

  <button type="submit">Login</button>
</form>
