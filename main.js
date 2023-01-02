
//SETUP
const carCanvas=document.getElementById("carCanvas")
carCanvas.width=200

const networkCanvas=document.getElementById("networkCanvas")
networkCanvas.width=300

const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width/2, carCanvas.width*0.9)

//sliders
const Nslider = document.getElementById("carNum")
const mutationSlider = document.getElementById("mutation")
const trafficSlider = document.getElementById("traffic")

let N
let cars = []
let difficulty
let mutation 
let bestCar
let traffic = []
let animationOn = false;

//these could be smarter on some function
carCanvas.height=window.innerHeight
networkCanvas.height=window.innerHeight
road.draw(carCtx)

function start() {
  N = Nslider.value
  cars = generateCars(N)
  difficulty = 600 - trafficSlider.value
  mutation = mutationSlider.value / 1000
  bestCar = cars[0]
  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(
        localStorage.getItem("bestBrain")
      )
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, mutation)
      }
    }
  }
  traffic = createTrafic(difficulty)

  if (!animationOn) {
    animationOn = true
    animate()
  }
}

function createTrafic(difficulty, N = 100) {
  let traffic = [
    new Car( road.getLaneCenter( 1 ), -100, 30, 50, "DUMMY", 1),
  ]
  
  for (let i = 1; i < N; i++) {
    traffic.push(
      new Car( road.getLaneCenter( Math.round( Math.random() * 3) ), i * -difficulty -100, 30, 50, "DUMMY", 1),
    )
  }

  return traffic
}

function save(){
  localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain))
}

function discard(){
  localStorage.removeItem("bestBrain")
}

function generateCars(N) {
  const cars = []
  for (let i = 0; i < N; i++) {
    cars.push(new Car( road.getLaneCenter(1), 100, 30, 50, "AI" ))
  }
  return cars
}

function animate() {
  draw()
  requestAnimationFrame(animate)
}

function draw() {
  for(let i=0; i<traffic.length; i++) {
    traffic[i].update(road.borders, [])
  }

  for(let i=0; i<cars.length; i++) {
    cars[i].update(road.borders, traffic)
  }

  bestCar = cars.find( c => c.y == Math.min( ...cars.map( c=>c.y )))

  carCanvas.height=window.innerHeight
  networkCanvas.height=window.innerHeight

  carCtx.save()
  carCtx.translate(0,-bestCar.y+carCanvas.height*0.7)

  road.draw(carCtx)
  for(let i=0; i<traffic.length; i++) {
    traffic[i].draw(carCtx, "red")
  }

  carCtx.globalAlpha = 0.5
  for(let i=0; i<cars.length; i++) {
    cars[i].draw(carCtx, "blue")
  }
  carCtx.globalAlpha = 1
  bestCar.draw(carCtx, "blue", true)

  carCtx.restore

  Visualizer.drawNetwork(networkCtx, bestCar.brain)
}
