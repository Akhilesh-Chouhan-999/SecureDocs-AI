import BaseRepository from "./base.repository";
import { User } from "../infrastructure/database/models";
import type { UserDocument } from "../types/domain";

/**
 * Repository layer handling User persistence operations
 */
export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(User);
  }

  /**
   * Look up user by unique email address
   * @param email The user email address
   */
  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: String(email).toLowerCase().trim() }).exec();
  }
}

export default UserRepository;
