
const clientID = 'Ov23liUnZqGG3ebbDhPv'
const clientSecret = 'd545ac82d78c37c46d191eb4d7f75ba25cfb27c9'

export default async function Index({ searchParams }: any) {
  const code = searchParams.code;
  const resp = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  });
  console.log('resp:', resp);
  const { access_token } = await resp.json();
  const userData = await fetch(
    'https://api.github.com/user',
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `token ${access_token}`
      }
    }
  );
  const user = await userData.json();
  console.log('user:', user);
  return (
    <div>
      <h1>{user.login}</h1>
      <div>
        <img width={200} height={200} src={user['avatar_url']} alt="user"/>
      </div>
    </div>
  )
}
