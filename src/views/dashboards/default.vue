<template>
  <Layout>
    <PageHeader title="Default" pageTitle="Dashboards" />

    <BRow>
      <BCol md="12"> 
        <Administrador/>
      </BCol>
    </BRow>
    
    <BRow>

    </BRow>

  </Layout>
</template>
<script setup>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Administrador from "@/components/dashboard/administrador"

</script>