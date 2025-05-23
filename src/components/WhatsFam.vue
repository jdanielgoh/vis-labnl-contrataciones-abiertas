<script setup>
import mensajes from '@/datos/whats.csv'
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as d3 from 'd3'

const diccionario_colores = {
  'Fernanda Gomh': new THREE.Color('rgb(133,21,244)'),
  'Angie Ma': new THREE.Color('rgb(239,88,0)'),
  'Jesus Pa': new THREE.Color('rgb(253,223,33)'),
  Nad: new THREE.Color('rgb(212,53,103)'),
  'Dan Bb': new THREE.Color('rgb(50,230,195)'),
}
onMounted(() => {
  // Definimos escalas y dimensiones del canvas
  const escalaAangulo = d3
    .scaleLinear()
    .domain([0, 1440])
    .range([0, 2 * Math.PI])
  const convertidorTiempo = d3.timeParse('%Y-%m-%d %H:%M:%S')
  const escalaZ = d3
    .scaleTime()
    .domain(d3.extent(mensajes, (d) => convertidorTiempo(d.fecha)))
    .range([-200, 200])

  let tamanio_canvas = {
    ancho: 800,
    alto: 500,
  }
  // Definimos variables que vamos a usar de forma "global"
  var escena, camara, renderizador
  var controls

  // Estas dos funciones engloban las etapas del renderizado y se definen más abajo
  inicializando()
  animando()

  function inicializando() {
    escena = new THREE.Scene()
    escena.background = new THREE.Color('rgb(30,30,30)')

    camara = new THREE.PerspectiveCamera(40, tamanio_canvas.ancho / tamanio_canvas.alto, 1, 1000)
    camara.position.z = 300

    const luzDireccional = new THREE.DirectionalLight('rgb(255,255,255)', 1)
    luzDireccional.position.set(10, 15, 20)
    const luzAmbiental = new THREE.AmbientLight('rgb(255,250,255)', 1)

    escena.add(luzDireccional)
    escena.add(luzAmbiental)
    var mesh
    for (var mensaje of mensajes) {
      if (mensaje.Tipo == 'Texto') {
        var fechaDate = convertidorTiempo(mensaje.fecha)
        var angulo = escalaAangulo(fechaDate.getMinutes() + fechaDate.getHours() * 60)
        var pz = escalaZ(fechaDate)
        var px = mensaje.Len * Math.cos(angulo)
        var py = mensaje.Len * Math.sin(angulo)
        mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.5, 0),
          new THREE.MeshStandardMaterial({ color: diccionario_colores[mensaje.Remit] }),
        )
        mesh.position.x = px
        mesh.position.y = py
        mesh.position.z = pz
        escena.add(mesh)
      }
    }

    renderizador = new THREE.WebGLRenderer()
    renderizador.setPixelRatio(window.devicePixelRatio)
    renderizador.setSize(tamanio_canvas.ancho, tamanio_canvas.alto)

    var container = document.getElementById('contenedor-canvas-whats')
    container.appendChild(renderizador.domElement)

    // Agregamos controles para poder mover la cámara
    controls = new OrbitControls(camara, renderizador.domElement)
    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 1.2
    controls.panSpeed = 0.8
    controls.noZoom = false
    controls.noPan = false
    controls.staticMoving = true
    controls.dynamicDampingFactor = 0.3
  }
  function animando() {
    requestAnimationFrame(animando)
    renderizador.render(escena, camara)
  }

  /*
  window.addEventListener('resize', () => {
    // Actualiza parametros del objeto tamanio_canvas
    tamanio_canvas.ancho = document.querySelector('#contenedor-canvas-whats').clientWidth
    tamanio_canvas.alto =
      document.querySelector('#contenedor-canvas-whats').clientWidth * 0.6 > 700
        ? 700
        : tamanio_canvas.ancho * 0.6

    // Actualiza el aspecto de la cámara
    camara.aspect = tamanio_canvas.ancho / tamanio_canvas.alto
    camara.updateProjectionMatrix()

    // Actualiza el tamaño del renderizado
    renderizador.setSize(tamanio_canvas.ancho, tamanio_canvas.alto)
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
    */
})
</script>
<template>
  <div id="contenedor-canvas-whats"></div>
</template>
<style scoped>
#contenedor-canvas-whats {
  alto: 600px;
}
</style>
