<script setup>
import * as d3 from "d3";
import { onMounted, ref } from "vue";

import contratos_tiempo from "@/datos/tabla_contrataciones_abiertas.csv";
import lista_colores from "@/datos/diccionario_servicios_color.json";
var diccionario_color = {};
for (var i = 0; i < lista_colores.length; i++) {
  diccionario_color[
    lista_colores[i].LICITACION_CLASIFICACION_ADICIONAL_CAT_GENERAL
  ] = lista_colores[i].COLOR;
}
const localeEs = d3.timeFormatLocale({
  dateTime: "%A, %e de %B de %Y, %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ],
  shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  months: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  shortMonths: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
});

const datoHover = ref();
const globoInformacion = ref(null);
onMounted(() => {
  /**
   * GRAFICA TEMPORAL
   */
  // Definimos las dimensiones del svg
  /*
  Desplaza el cursor sobre los nodos para ver licitaciones en el tiempo 
  */
  var anchoSvg = document.querySelector("div#vis-red").clientWidth;
  var altoSvg = anchoSvg;
  var margenes = { derecha: 20, izquierda: 35, arriba: 20, abajo: 40 };

  var svg = d3
    .select("svg#svg-tiempo")
    .attr("width", anchoSvg)
    .attr("height", altoSvg);

  var ancho = anchoSvg - margenes.izquierda - margenes.derecha;
  var alto = altoSvg - margenes.arriba - margenes.abajo;

  var grupoGrafica = svg
    .select("g#grupo-grafica")
    .attr(
      "transform",
      "translate(" + margenes.izquierda + "," + margenes.arriba + ")"
    );

  // Escalas
  var convertidorTextoTiempo = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");

  var escalaTemporal = d3
    .scaleTime()
    .domain(
      d3.extent(contratos_tiempo.map((d) => convertidorTextoTiempo(d.FECHA)))
    )
    .range([0, ancho]);
  var escalaMonto = d3
    .scaleLog()
    .domain(d3.extent(contratos_tiempo.map((d) => +d.GANADOR_MONTO)))
    .range([alto, 0]);

  var puntos = grupoGrafica
    .selectAll("circle.puntos")
    .data(contratos_tiempo)
    .enter()
    .append("circle")
    .attr(
      "class",
      (d) =>
        "puntos " +
        d.COMPRADOR_ID?.replace("&", "y") +
        " " +
        d.GANADOR_ID?.replace("&", "y")
    )
    .attr("cx", (d) => escalaTemporal(convertidorTextoTiempo(d.FECHA)))
    .attr("cy", (d) => escalaMonto(+d.GANADOR_MONTO))
    .attr("r", 2)
    .style(
      "fill",
      (d) => diccionario_color[d.LICITACION_CLASIFICACION_ADICIONAL_CAT_GENERAL]
    )
    .style("fill-opacity", 0.4);
  puntos
    .on("mouseover", (evento, dato) => {
      globoInformacion.value.style.left = evento.layerX + 10 + "px";
      globoInformacion.value.style.top = evento.layerY + 10 + "px";
      datoHover.value = dato;
      console.log(dato);
      puntos.style("fill-opacity", 0.4);
      d3.select(evento.target)
        .style("fill-opacity", 1)
        .attr("r", 5)
        .style("stroke", "black");
    })
    .on("mouseout", (evento, dato) => {
      datoHover.value = null;
      d3.select(evento.target)
        .style("fill-opacity", 0.4)
        .attr("r", 2)
        .style("stroke", "none");
    });

  // Agregamos ejes

  svg
    .select("g#grupo-eje-monto")
    .attr("transform", `translate(${margenes.izquierda},${margenes.arriba})`)
    .call(d3.axisLeft(escalaMonto));

  var ejeTiempo = svg
    .select("g#grupo-eje-tiempo")
    .attr(
      "transform",
      `translate(${margenes.izquierda},${margenes.arriba + alto})`
    )
    .call(
      d3
        .axisBottom(escalaTemporal)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(localeEs.format("%b/%Y"))
    );

  ejeTiempo
    .selectAll("text")
    .style("text-anchor", "end")
    .style("transform", "translate(0,0)rotate(-30deg)");
});
</script>

<template>
  <div>
    <div
      ref="globoInformacion"
      class="globo-informacion"
      :class="{ activo: datoHover }"
    >
      <p>
        <b>OCID:</b> {{ datoHover?.OCID }}<br />
        <b>Comprador</b>: {{ datoHover?.COMPRADOR_NOMBRE }}<br />
        <b>Proveedor</b>: {{ datoHover?.GANADOR_NOMBRE }}<br />
        <b>Monto planeado *</b>: ${{
          (+datoHover?.PLANEACION_MONTO).toLocaleString("en")
        }}<br />
        <b>Monto final</b>: ${{
          (+datoHover?.GANADOR_MONTO).toLocaleString("en")
        }}<br />

        <b>Categoría general del servicio:</b
        >{{ datoHover?.LICITACION_CLASIFICACION_ADICIONAL_CAT_GENERAL }}<br />
        <b>Licitación clasificación</b>:
        {{ datoHover?.LICITACION_CLASIFICACION }}
      </p>
    </div>
    <svg id="svg-tiempo">
      <g id="grupo-eje-tiempo"></g>

      <g id="grupo-eje-monto"></g>
      <g id="grupo-grafica"></g>
    </svg>
    <div class="nomenclatura">
      <p><b>Categorías de los servicios y porcentaje gastado en éstos </b></p>
      <p
        v-for="(servicio, i) in lista_colores.slice(0, 5)"
        :key="i"
        style="font-size: 12px"
      >
        <span class="nom" :style="{ background: servicio.COLOR }"></span>
        {{ servicio.LICITACION_CLASIFICACION_ADICIONAL_CAT_GENERAL }} ({{
          servicio.GANADORES_MONTO.toLocaleString("en")
        }}%)
      </p>
      <p style="font-size: 12px">
        <span class="nom" :style="{ background: 'rgb(150,150,150)' }"></span>
        Otros (25.5%)
      </p>
    </div>
  </div>
</template>

<style lang="scss"></style>
