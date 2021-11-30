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
const radius = 5;
const geometry = new THREE.SphereGeometry(radius, 50, 50);
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
const atmosphereGeometry = new THREE.SphereGeometry(radius, 50, 50);
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

const pointRadius = 0.1;

function createPoint(data) {
	const pointGeometry = new THREE.SphereGeometry(pointRadius, 50, 50);
	const pointMaterial = new THREE.MeshBasicMaterial({
		color: "#FFF01F",
		opacity: 0.4,
		transparent: true,
	});
	const point = new THREE.Mesh(pointGeometry, pointMaterial);

	// Apollo 11 landing location 0.41 N	23.26 E
	const north = (data.north / 180) * Math.PI;
	const east = (data.east / 180) * Math.PI;

	const x = radius * Math.cos(north) * Math.sin(east);
	const y = radius * Math.sin(north);
	const z = radius * Math.cos(north) * Math.cos(east);

	point.position.x = x;
	point.position.y = y;
	point.position.z = z;

	point.object = data.object;
	point.category = data.us_category;
	point.country = data.country;
	point.year = data.launch_year;

	group.add(point);
}

d3.csv("data/manmade_material_location_available.csv", function (d) {
	d.north = +d.north;
	d.east = +d.east;
	return d;
}).then(function (data) {
	console.log(data);
	data.forEach((d) => createPoint(d));
});

sphere.rotation.y = -Math.PI / 2;
group.rotation.offset = {
	x: 0,
	y: 0,
};

const mouse = {
	x: undefined,
	y: undefined,
	down: false,
	xPrev: undefined,
	yPrev: undefined,
};

const raycaster = new THREE.Raycaster();
const tooltip = document.querySelector(".tooltip");
const object = document.querySelector("#object");
const category = document.querySelector("#category");
const country = document.querySelector("#country");
const year = document.querySelector("#year");

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	// group.rotation.y += 0.0005;

	// group.rotation.y = mouse.x;

	// if (mouse.x) {
	// 	gsap.to(group.rotation, {
	// 		x: -mouse.y * 1.5,
	// 		y: mouse.x * 1.5,
	// 		duration: 2,
	// 	});
	// }

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(
		group.children.filter(
			(mesh) => mesh.geometry.parameters.radius === pointRadius
		)
	);

	group.children.forEach((mesh) => {
		mesh.material.opacity = 0.4;
	});

	gsap.set(tooltip, {
		display: "none",
	});

	for (let i = 0; i < intersects.length; i++) {
		const point = intersects[i].object;
		point.material.opacity = 1;
		gsap.set(tooltip, {
			display: "block",
		});
		object.innerHTML = point.object;
		category.innerHTML = point.category ? point.category : "";
		country.innerHTML = point.country;
		year.innerHTML = point.year;
	}

	renderer.render(scene, camera);
}

animate();
// renderer.render(scene, camera);

canvasContainer.addEventListener("mousedown", ({ clientX, clientY }) => {
	mouse.down = true;
	mouse.xPrev = clientX;
	mouse.yPrev = clientY;
});

addEventListener("mousemove", (event) => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / innerHeight) * 2 + 1;

	gsap.set(tooltip, {
		x: event.clientX,
		y: event.clientY,
	});

	if (mouse.down) {
		event.preventDefault();
		const deltaX = event.clientX - mouse.xPrev;
		const deltaY = event.clientY - mouse.yPrev;

		group.rotation.offset.x += deltaY * 0.005;
		group.rotation.offset.y += deltaX * 0.005;

		gsap.to(group.rotation, {
			y: group.rotation.offset.y,
			x: group.rotation.offset.x,
			duration: 2,
		});

		// group.rotation.y += deltaX * 0.005;
		// group.rotation.x += deltaY * 0.005;
		mouse.xPrev = event.clientX;
		mouse.yPrev = event.clientY;
	}
});

addEventListener("mouseup", (event) => {
	mouse.down = false;
});
