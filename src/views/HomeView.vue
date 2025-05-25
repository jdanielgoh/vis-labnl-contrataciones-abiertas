<script setup>
import ContratacionesRed from "@/components/ContratacionesRed.vue";
</script>

<template>
  <main>
    <h1>Así se gasta en Nuevo León</h1>
    <p>Análisis en proceso y no verificado al 100% *</p>
    <div class="contenedor-texto">
      <p>
        En esta visualización se representan las relaciones entre dependencias
        de gobierno y proveedores, así como las licitaciones y los montos a
        través del tiempo, a partir de los datos abiertos de
        <a
          href="https://catalogodatos.nl.gob.mx/dataset/contrataciones-abiertas-direccion-general-de-adquisiciones-y-servicios"
          >Contrataciones Abiertas de la Dirección General de Adquisiciones y
          Servicios
        </a>
        del estado de Nuevo León.
      </p>
    </div>

    <div class="contenedor">
      <ContratacionesRed></ContratacionesRed>
    </div>
    <div class="contenedor">
      <div class="contenedor-texto">
        <p>
          Se usó lo biblioteca
          <a href="https://github.com/open-contracting/ocdskit">ocdskit</a> de
          python para trabajar la base de contrataciones. Se unieron todos los
          registros con la función merge y seleccionamos sólo aquellos contratos
          que ya tuvieran <i>winner</i> asignado.<a
            href="https://drive.google.com/drive/folders/15iUYwREIKoHeCjLO4dzNAJjgDQSn4b_Z?usp=drive_link"
          >
            En este enlace de drive se encuentra el script del análisis.</a
          >
        </p>
        <p>
          Ésta herramienta representa una guia para explorar contrataciones, sin
          embargo, se recomienda verificar en la fuente original y con las
          despendencias correspondientes cualquier dato para ser verificado.
        </p>
        <p>
          * En la gráfíca temporal, hay una mínima parte de los puntos (menos
          del 0.5%) que consisten en licitaciones en dónde hubo más de un
          proveedor. Estos casos pueden mostrar en el globo de información el
          monto total planeado de toda la licitación, pero el gasto ejercido
          corresponde sólo a lo de un proveedor. Es por ello que es recomendable
          acudir a la fuente original para conocer los detalles de la
          licitación.
        </p>

        <p>
          Éste proyecto fue desarrollado para el Aprender haciendo:
          Visualicación creativa de datos, en el marco de la Semana de Gobierno
          Abierto de 2025, impulsado por
          <a href="https://www.labnuevoleon.mx/">labnl</a>.
        </p>
      </div>
    </div>
  </main>
</template>
<style scoped lang="scss">
.contenedor {
  width: 100%;
  display: flex;
  margin-top: 40px;
  flex-wrap: nowrap;
  .visualizacion {
    flex: 50%;
  }

  @media (max-width: 700px) {
    flex-wrap: wrap;
    .visualizacion {
      flex: 100%;
    }
  }
}
.contenedor-texto {
  max-width: 800px;
  p {
    margin-top: 24px;
  }
}
</style>
