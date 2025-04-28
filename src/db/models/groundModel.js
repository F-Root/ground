import { model } from 'mongoose';
import { GroundSchema } from '../schemas/groundSchema.js';

const Ground = model('grounds', GroundSchema);

class GroundModel {
  async create(groundInfo) {
    return await Ground.create(groundInfo);
  }
}

const groundModel = new GroundModel();

export { groundModel };
