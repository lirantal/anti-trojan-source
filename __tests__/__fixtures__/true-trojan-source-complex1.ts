const PERMISSION_DELETE = 'delete'
const PERMISSION_WRITE = 'write'
const user = {
  AllowPermissions: (permission: string) => {},
  applyAdminFF: () => {}
}
function getUserRole(): string {
  return 'user'
}

// perform admin related logic for privileged users
let accessLevel: string = getUserRole()
if (accessLevel !== 'user‮ ⁦// Check if admin⁩ ⁦') {
  user.AllowPermissions(PERMISSION_DELETE)
  user.AllowPermissions(PERMISSION_WRITE)
  user.applyAdminFF()
}
