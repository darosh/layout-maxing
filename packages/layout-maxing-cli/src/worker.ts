import { fitness } from 'layout-maxing'

self.onmessage = (e) => {
  self.postMessage(fitness(e.data[0], e.data[1], e.data[2]))
}
