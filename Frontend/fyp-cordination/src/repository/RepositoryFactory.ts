import AuthRepository from "./AuthRepository";
import SessionRepository from "./SessionRepository";
import UserRepository from "./UserRepository";
import GroupRepository from "./GroupRepository";
import UploadRepository from "./UploadRepository";

const repositories: Record<string, any> = {
  auth: AuthRepository,
  sessions: SessionRepository,
  users: UserRepository,
  groups: GroupRepository,
  upload: UploadRepository,
};
export default {
  get: (name: string) => {
    return repositories[name];
  },
};
