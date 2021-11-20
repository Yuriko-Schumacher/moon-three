const vertexShader = `
  varying vec2 vertexUV;
  varying vec3 vertexNormal;

  void main() {
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragmentShader = `
  uniform sampler2D globeTexture;

  varying vec2 vertexUV; // vec2(0, 0.24)
  varying vec3 vertexNormal;

  void main() {
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(1, 1, 1) * pow(intensity, 1.5);

    gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
  }
`;

const atmosphereVertexShader = `
  varying vec3 vertexNormal;

  void main() {
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 0.9 );
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vertexNormal; // (0, 0, 0)

  void main() {
    float intensity = pow(0.7 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(1, 1, 1, 1.0) * intensity;
  }
`;
