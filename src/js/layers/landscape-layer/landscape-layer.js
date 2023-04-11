import { Layer } from '../layer';

/** @extends {Layer<THREE.MeshBasicMaterial>} */
class LandscapeLayer extends Layer {
  constructor() {
    super();
    console.info('Landscape constructor');
  }
}

export default LandscapeLayer;
