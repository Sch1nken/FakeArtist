<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, inject } from "vue";


import MainView from "./views/MainView.vue";
import RoomSelectionView from "./views/RoomSelectionView.vue";

import { Socket } from 'socket.io-client';
import { SocketInstance } from "./main";

import { socketState } from "./socket";
import { useConnectionStore } from './stores/connection';

const socket = inject<Socket>(SocketInstance);

socket?.off();

var connectionStore = useConnectionStore();

connectionStore.bindEvents();

</script>

<template>
  <main>
    <h1>Fake Artist</h1>

    <div class="socket-status">
      Status:
      <span>
        {{ connectionStore.$state.isConnected ? 'Online' : 'Offline' }}
      </span>
    </div>

    <!-- <nav>
      <router-link v-slot="{ href, route, navigate }" to="/">
        <button :href="href" @click="navigate">
          {{ route.name }}

        </button></router-link>
      <router-link to="/room-selection">Room Select</router-link>
    </nav> !-->

    <div class="view-display">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>
  </main>
</template>

<style scoped></style>
