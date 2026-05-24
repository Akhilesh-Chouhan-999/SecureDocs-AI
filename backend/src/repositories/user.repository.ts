import { BaseRepository } from "./base.repository.js";
import User from "../models/User.js";

/**
 * Repository layer handling User persistence operations
 */
export class UserRepository extends BaseRepository {

  constructor() {
    super(User);
  }

  /**
   * Look up user by unique email address
   * @param email The user email address
   */
  async findByEmail(email: string) {
    return this.model
      .findOne({ email: String(email).toLowerCase().trim() })
      .exec();
  }

}
