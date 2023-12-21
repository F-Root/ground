import { groundModel } from '../db/models/groundModel.js';

class GroundService {
  constructor(groundModel) {
    this.groundModel = groundModel;
  }
}

const groundService = new GroundService(groundModel);

export { groundService };
