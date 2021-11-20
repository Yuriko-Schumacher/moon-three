console.log(vertexShader);

const canvasContainer = document.querySelector("#canvasContainer");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	canvasContainer.offsetWidth / canvasContainer.offsetHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: document.querySelector("canvas"),
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// create a sphere
const geometry = new THREE.SphereGeometry(5, 50, 50);
const texture = new THREE.TextureLoader().load("./img/moon.jpeg");
const material = new THREE.ShaderMaterial({
	// color: 0xff0000,
	// map: texture,
	vertexShader, // vertexShader: vertexShader
	fragmentShader, // fragmentShader: fragmentShader
	uniforms: {
		globeTexture: {
			value: texture,
		},
	},
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// create atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(5, 50, 50);
const atmosphereMaterial = new THREE.ShaderMaterial({
	// color: 0xff0000,
	// map: texture,
	vertexShader: atmosphereVertexShader,
	fragmentShader: atmosphereFragmentShader,
	blending: THREE.AdditiveBlending,
	side: THREE.BackSide,
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.set(1.1, 1.1, 1.1);

scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
	color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
	const x = (Math.random() - 0.5) * 2000;
	const y = (Math.random() - 0.5) * 2000;
	const z = -Math.random() * 3000;
	starVertices.push(x, y, z);
}

starGeometry.setAttribute(
	"position",
	new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 10;

const mouse = {
	x: undefined,
	y: undefined,
};
addEventListener("mousemove", (event) => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	sphere.rotation.y += 0.001;
	// group.rotation.y = mouse.x;
	gsap.to(group.rotation, {
		x: -mouse.y * 0.3,
		y: mouse.x * 0.5,
		duration: 2,
	});
}

animate();
// renderer.render(scene, camera);
