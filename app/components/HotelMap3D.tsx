import { useStore } from '@/store/useStore';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
// import { useStore } from '../store/useStore';

interface HotelMap3DProps {
    className?: string;
}

type Room = {
    id: string;
    name: string;
    color: string | number;
    size: [number, number, number];
    position: [number, number, number]; // ✅ Tuple type fixes the issue
};

const HotelMap3D: React.FC<HotelMap3DProps> = ({ className = '' }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>(null);
    const rendererRef = useRef<THREE.WebGLRenderer>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const { setSelectedRoom, setHoveredRoom, hoveredRoom } = useStore();

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 15);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Hotel floor plan (base)
        const floorGeometry = new THREE.BoxGeometry(20, 0.2, 15);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        scene.add(floor);

        // Room definitions
        const rooms = [
            { id: 'spa', name: 'Spa', position: [-7, 1, -5], color: 0x8B5CF6, size: [3, 2, 3] },
            { id: 'gym', name: 'Gym', position: [7, 1, -5], color: 0xEF4444, size: [3, 2, 3] },
            { id: 'pool', name: 'Pool', position: [0, 1, 5], color: 0x06B6D4, size: [6, 2, 3] },
            { id: 'restaurant', name: 'Restaurant', position: [0, 1, -5], color: 0xF59E0B, size: [4, 2, 3] },
            { id: 'lobby', name: 'Lobby', position: [0, 1, 0], color: 0x10B981, size: [4, 2, 4] }
        ];

        // Create room meshes
        rooms.forEach(room => {
            const geometry = new THREE.BoxGeometry(...room.size);
            const material = new THREE.MeshLambertMaterial({
                color: room.color,
                transparent: true,
                opacity: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...(room.position as [number, number, number]));

            mesh.castShadow = true;
            mesh.userData = {
                id: room.id,
                name: room.name,
                details: `Click to explore the ${room.name.toLowerCase()}`,
                originalColor: room.color
            };

            scene.add(mesh);
            roomMeshesRef.current.set(room.id, mesh);
        });

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleMouseMove = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const roomMeshes = Array.from(roomMeshesRef.current.values());
            const intersects = raycaster.intersectObjects(roomMeshes);

            // Reset all room colors
            roomMeshes.forEach(mesh => {
                const material = mesh.material as THREE.MeshLambertMaterial;
                material.color.setHex(mesh.userData.originalColor);
                material.opacity = 0.8;
            });

            if (intersects.length > 0) {
                const intersected = intersects[0].object as THREE.Mesh;
                const material = intersected.material as THREE.MeshLambertMaterial;
                material.color.setHex(0xffffff);
                material.opacity = 1.0;
                setHoveredRoom(intersected.userData.id);
                renderer.domElement.style.cursor = 'pointer';
            } else {
                setHoveredRoom(null);
                renderer.domElement.style.cursor = 'default';
            }
        };

        const handleClick = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const roomMeshes = Array.from(roomMeshesRef.current.values());
            const intersects = raycaster.intersectObjects(roomMeshes);

            if (intersects.length > 0) {
                const intersected = intersects[0].object as THREE.Mesh;
                setSelectedRoom({
                    roomId: intersected.userData.id,
                    roomName: intersected.userData.name,
                    details: intersected.userData.details,
                    position: {
                        x: intersected.position.x,
                        y: intersected.position.y,
                        z: intersected.position.z
                    }
                });
            }
        };

        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('click', handleClick);

        // Camera controls (basic orbit)
        let mouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseDown = (event: MouseEvent) => {
            mouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleMouseUp = () => {
            mouseDown = false;
        };

        const handleMouseMoveCamera = (event: MouseEvent) => {
            if (!mouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);

            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleWheel = (event: WheelEvent) => {
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            const newDistance = Math.max(5, Math.min(30, distance + event.deltaY * 0.01));

            const direction = new THREE.Vector3();
            direction.subVectors(camera.position, new THREE.Vector3(0, 0, 0)).normalize();
            camera.position.copy(direction.multiplyScalar(newDistance));
        };

        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('mousemove', handleMouseMoveCamera);
        renderer.domElement.addEventListener('wheel', handleWheel);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current) return;

            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);
        setIsLoading(false);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousemove', handleMouseMove);
            renderer.domElement.removeEventListener('click', handleClick);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            renderer.domElement.removeEventListener('mouseup', handleMouseUp);
            renderer.domElement.removeEventListener('mousemove', handleMouseMoveCamera);
            renderer.domElement.removeEventListener('wheel', handleWheel);

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [setSelectedRoom, setHoveredRoom]);

    return (
        <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            <div
                ref={mountRef}
                className="w-full h-full min-h-[400px]"
                style={{ aspectRatio: '16/9' }}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
                <p>🖱️ Click rooms to explore • Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    );
};

export default HotelMap3D;