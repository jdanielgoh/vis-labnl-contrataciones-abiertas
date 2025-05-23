<script setup>
import * as d3 from "d3";
import { onMounted, ref } from "vue";
import ContratacionesTemporal from "@/components/ContratacionesTemporal.vue";

import contratos_red from "@/datos/contrataciones_abiertas_red.json";
const datoHover = ref();
const globoInformacion = ref(null);
const tiempo_transicion = 200;
onMounted(() => {
  //Constlación de contrataciones abiertas
  // Galaxia de contrataciones abiertas
  // ¿en qué gasta Nuevo León?
  // En qué se gastan nuestos impuestos
  // Así se gasta en Nuevo León

  /**
   * RED DE CONTRATACIONES
   */
  // Definimos las dimensiones del svg
  var ancho = document.querySelector("div#vis-red").clientWidth;
  var alto = ancho;
  // Definimos una variable llamada svgRed que apunta al elemento svg del documento
  // que contendrá la red
  var svg = d3.select("svg#svg-red").attr("width", ancho).attr("height", alto);

  var rp = 0.000003 * ancho;
  // Definimos una variable llamada grupoRed que apunta al elemento g dentro del svgRed
  // y lo trasladamos al centro del svg
  var grupo = svg
    .select("g#grupo-red")
    .attr("transform", "translate(" + ancho * 0.5 + "," + alto * 0.5 + ")");
  // Aquí creamos una línea por cada conexión al meter la
  // lista de links en .data(), hacer .enter() y después el .append("line")
  // y de una vez le dimos un stroke-width proporcional a cada línea

  var enlaces = grupo
    .selectAll("line.enlace")
    .data(contratos_red.links)
    .enter()
    .append("line")
    .attr("class", "enlace")
    .style("stroke-width", (d) => 1 + 0.0005 * Math.sqrt(d.peso_ganador_monto))
    .style("stroke", "#945979")
    .attr("class", (d) => {
      return d.source.id
        ? (d.source.id + " " + d.target.id).replace("&", "y")
        : (d.source + " " + d.target).replace("&", "y");
    })
    .style("stroke-opacity", 0.5);
  // Aquí creamos un círculo por cada nodo al meter la
  // lista de nodes en .data(), hacer .enter() y después el .append("circle")
  // y de una vez le dimos área a cada círculo en proporción al monto del ganadores
  var nodos = grupo
    .selectAll("g.nodos")
    .data(contratos_red.nodes)
    .enter()
    .append("g")
    .attr("r", (d) => rp * Math.sqrt(d.MONTO_EJERCIDO))
    //.style("fill", (d) => (d.TIPO == "COMPRADOR" ? "#ad3805" : "blue"))
    .attr("class", (d) => d.id?.replace("&", "y"));
  var nodosEjercidos = nodos
    .append("circle")
    .style("fill", (d) => (d.TIPO == "PROVEDOR" ? "#087E8B" : "#FF7A59"))
    .attr("r", (d) => rp * Math.sqrt(d.MONTO_EJERCIDO));
  var nodosPlaneados = nodos
    .append("circle")
    .style("fill", "none")
    .attr("r", (d) => rp * Math.sqrt(d.MONTO_PLANEADO))
    .style("stroke", "#fff");

  // Hasta aquí creamos los elementos y están todos que les faltan estilos y atributos.
  // Creamos una simulación de fuerzas para que se asignen posiciones
  // mediante esta simulación

  d3.forceSimulation(contratos_red.nodes)
    .force(
      "link",
      d3.forceLink(contratos_red.links).id((d) => d.id)
    )
    .force(
      "collide",
      d3.forceCollide(
        (d) => 2 + rp * Math.sqrt(d3.max([d.MONTO_EJERCIDO, d.MONTO_PLANEADO]))
      )
    )
    .force("charge", d3.forceManyBody().strength(-30))
    .force(
      "x",
      d3.forceX().strength((d) => (d.TIPO == "PROVEDOR" ? -0.2 : 2.5))
    )
    .force(
      "y",
      d3.forceY().strength((d) => (d.TIPO == "PROVEDOR" ? -0.2 : 2.5))
    )
    .on("tick", () => {
      enlaces
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodos.attr("transform", (d) => {
        var r = Math.sqrt(d.x * d.x + d.y * d.y);
        d.r = r;
        var theta = Math.atan2(d.y, d.x);
        d.theta = theta;
        if (d.TIPO == "PROVEDOR") {
          if (d.r > ancho * 0.42) {
            d.r = ancho * 0.42;
          } else if (d.r < ancho * 0.3) {
            d.r = ancho * 0.3;
          }
        } else {
          if (d.r > ancho * 0.3) {
            d.r = ancho * 0.3;
          }
        }
        d.x = d.r * Math.cos(d.theta);
        d.y = d.r * Math.sin(d.theta);
        return `translate(${d.x},${d.y})`;
      });
    });

  // YA TENEMOS NUESTRA RED, VAMOS A DEFINIR INERACCIONES

  nodos
    .on("mousemove", (evento, dato) => {
      // Mandando datos al globo de información
      globoInformacion.value.style.left = evento.layerX + 10 + "px";
      globoInformacion.value.style.top = evento.layerY + 10 + "px";
      datoHover.value = dato;
    })
    .on("mouseover", (e, d) => {
      datoHover.value = d;

      // Interactividad en nodos y links:
      nodos
        .interrupt()
        .transition()
        .duration(tiempo_transicion)
        .style("opacity", 0.1);
      enlaces
        .interrupt()
        .transition()
        .duration(tiempo_transicion)
        .style("stroke-opacity", 0);
      nodos
        .selectAll("g." + d.id?.replace("&", "y"))
        .interrupt()
        .transition()
        .duration(tiempo_transicion)
        .style("opacity", 1);
      svg
        .selectAll("line." + d.id?.replace("&", "y"))
        .each((dd) => {
          svg
            .selectAll("g." + dd.source.id?.replace("&", "y"))
            .interrupt()
            .transition()
            .duration(tiempo_transicion)
            .style("opacity", 1);
          svg
            .selectAll("g." + dd.target.id?.replace("&", "y"))
            .interrupt()
            .transition()
            .duration(tiempo_transicion)
            .style("opacity", 1);
        })
        .interrupt()
        .transition()
        .duration(tiempo_transicion)
        .style("stroke-opacity", 1);

      var svgTemporal = d3.selectAll("svg#svg-tiempo");
      svgTemporal.selectAll("circle").style("fill-opacity", 0.05);
      svgTemporal
        .selectAll("circle." + d.id?.replace("&", "y"))
        .style("fill-opacity", 0.8)
        .attr("r", 5);
    })
    .on("mouseout", (evento, d) => {
      datoHover.value = null;
      nodos
        .interrupt()
        .transition()
        .duration(tiempo_transicion)
        .style("opacity", 1);
      enlaces
        .transition()
        .duration(tiempo_transicion)
        .style("stroke-opacity", 0.3);
      var svgTemporal = d3.selectAll("svg#svg-tiempo");
      svgTemporal.selectAll("circle").style("fill-opacity", 0.5).attr("r", 2);
    });
});
</script>

<template>
  <div class="visualizacion" id="vis-red">
    <h2>Red de dependencias-proveedores</h2>
    <p>
      Cada círculo representa una dependencia o proveedor según el color. El
      tamaño de la círcunferencia negra corresponde al acumulado de montos
      planeados en las licitaciones en las que los participantes se han
      involucrado, mientras que el área del disco de color corresponde al
      acumulado de los montos ejercidos.
    </p>
    <p>
      Selecciona un círculo (nodo) para ver con mejor detalle sus relaciones o
      ver en la gráfica de la izquieda las licitaciones en cuestión.
    </p>
    <div>
      <div
        ref="globoInformacion"
        class="globo-informacion"
        :class="{ activo: datoHover }"
      >
        <p>
          <b>{{
            datoHover?.TIPO == "PROVEDOR" ? "Proveedor" : "Dependencia"
          }}</b>
          :
          {{
            datoHover?.TIPO == "PROVEDOR"
              ? datoHover?.GANADOR_NOMBRE
              : datoHover?.COMPRADOR_NOMBRE
          }}<br />
          <b>Monto planeado</b>
          : ${{ datoHover?.MONTO_PLANEADO?.toLocaleString("en") }}<br />
          <b>Monto ejercido</b>
          : ${{ datoHover?.MONTO_EJERCIDO?.toLocaleString("en") }}<br />
        </p>
      </div>
      <svg id="svg-red">
        <g id="grupo-red"></g>
      </svg>
      <div class="nomenclatura">
        <p><b>Tipo de monto</b></p>
        <p>
          <span class="nom planeado"></span>Planeado <br />
          <span class="nom pagado"></span>Pagado
        </p>
        <p><b>Tipo de actor</b></p>
        <p>
          <span class="nom dependencia"></span>Dependencia gubernamental <br />
          <span class="nom proveedor"></span>Poveedor de productos y servicios
        </p>
      </div>
    </div>
  </div>
  <div class="visualizacion" id="vis-tiempo">
    <h2>Licitaciones en el tiempo</h2>
    <p>
      En ésta gráfica cada punto representa un contrato, su posición vertical
      indica el monto pagado en escala logarítmica, mientras que la posición en
      el eje horizontal corresponde a la última fecha en la que el contrato tuvo
      una modificación. Puedes pasar tu cursor para obtener más detalle sobre
      cada licitación
    </p>
    <div>
      <ContratacionesTemporal></ContratacionesTemporal>
    </div>
  </div>
</template>

<style lang="scss">
.globo-informacion {
  display: none;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  width: 250px;
  padding: 8px;
  font-size: 14px;
  color: #000;
  position: absolute;
  z-index: 1;
  border-radius: 8px;
}
.globo-informacion.activo {
  display: inherit;
}
div.nomenclatura {
  p span.nom {
    margin-left: 16px;
    margin-right: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
    &.planeado {
      border: 1px solid white;
    }
    &.pagado {
      background: rgb(219, 219, 219);
    }
    &.dependencia {
      background: #ff7a59;
      border-radius: 0;
    }
    &.proveedor {
      background: rgb(8, 126, 139);
      border-radius: 0;
    }
  }
}
b {
  font-weight: 700;
}
</style>
