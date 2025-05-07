import { isNull } from '../views/public/util.js';
import { getImgSASUrl } from '../utils/index.js';

const imgSASUrlGenerator = async (req, res, next) => {
  const img = req.file;
  const imgInfo = !isNull(img) ? await getImgSASUrl(img) : {};
  req.body.imgInfo = imgInfo;
  next();
};

export { imgSASUrlGenerator };
