<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { SocketInstance } from '../main';
import { Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { socketState } from '../socket';
import { useConnectionStore } from '../stores/connection';

const router = useRouter();

const playerName = ref<string>('');

var connectionStore = useConnectionStore();
const gameStore = useGameStore();

const socket = inject<Socket>(SocketInstance);

onMounted(() => {
  if (!socket) {
    return;
  }

  socket.connect();

  console.log(socket);
});

function startJourney() {
  if (playerName.value.trim() === '') {
    alert('Please enter your name!');
    return;
  }
  console.log(`${playerName.value} starting their journey!`);
  router.push("/room-selection");
}
</script>

<template>
  <div class="view-container">
    <Transition name="fade" mode="out-in">
      <div v-if="!connectionStore.$state.isConnected">
        Connecting...
      </div>
      <div v-else>
        <p>Please enter a username.</p>

        <input type="text" placeholder="Username" v-model="playerName" />
        <button @click="startJourney">Play</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
input {
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 80%;
  max-width: 300px;
  font-size: 1em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>