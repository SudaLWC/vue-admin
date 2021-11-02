<template>
  <div>
    <!-- <h1>Welcome</h1> -->
    <div class="bgWrap">
      <h1>Welcome</h1>
      <div class="blackWrap">
        <div class="black" id="black">
          <div class="blackM">
            <img src="../assets/images/bg2.png" alt="" />
          </div>
          <div class="blackM">
            <img src="../assets/images/bg2.png" alt="" />
          </div>
        </div>
      </div>
      <div class="whiteWrap">
        <div class="white" id="white">
          <div class="whiteM">
            <img src="../assets/images/bg1.png" alt="" />
          </div>
          <div class="whiteM">
            <img src="../assets/images/bg1.png" alt="" />
          </div>
        </div>
      </div>
      <!-- <div class="whiteM"></div> -->
      <div class="bear"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {},
  mounted() {
    let left1 = 0;
    let black = document.getElementById("black");
    function move1() {
      if (parseInt(black.style.left) < -2024.6) {
        left1 = 0;
        black.style.left = left1;
      }
      left1++;
      black.style.left = "-" + left1 + "px";
    }
    setInterval(move1, 100);
    let left2 = 0;
    let white = document.getElementById("white");
    function move2() {
      if (parseInt(white.style.left) < -2285.7) {
        left2 = 0;
        white.style.left = left2;
      }
      left2++;
      white.style.left = "-" + left2 + "px";
    }
    setInterval(move2, 40);
  },
};
</script>

<style lang="css" scoped>
.black img {
  width: 2024.6px;
  height: 300px;
}

.white img {
  /* display: block;
      position: absolute; */
  width: 2285.7px;
  height: 200px;
  /* filter: drop-shadow(0 300px #f4f4f4b0);
      top: -300px; */
  /* filter: grayscale(10); */
  /* filter: hue-rotate(100deg) invert(80%); */
}

.bgWrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgb(30, 16, 53);
  overflow: hidden;
}
h1 {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  font-size: 40px;
  color: #fff;
  animation: blink 5s linear infinite;
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.1;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
.blackWrap {
  width: 4049.2px;
  height: 300px;
}

.whiteWrap {
  width: 4571.4px;
  height: 200px;
}

.black {
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  left: 0;
  bottom: 25px;
  overflow: hidden;
}

.white {
  display: flex;
  flex-wrap: nowrap;
  position: absolute;
  left: 0;
  bottom: 0px;
  overflow: hidden;
}

.blackM {
  width: 2024.6px;
  height: 300px;
  opacity: 0.5;
}

.whiteM {
  width: 2285.7px;
  height: 200px;
}

.blackM,
.black img {
  animation: scaleB 3s;
}

.whiteM,
.white img {
  animation: scaleW 3s;
}

@keyframes scaleB {
  0% {
    width: 3840px;
    height: 569px;
  }

  100% {
    width: 2024.6px;
    height: 300px;
  }
}

@keyframes scaleW {
  0% {
    width: 3840px;
    height: 336px;
  }

  100% {
    width: 2285.7px;
    height: 200px;
  }
}

/* .whiteM {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 200px;
      background: url(./bg1.png) no-repeat;
      background-size: cover;
      animation: wMove 16s linear infinite;
    }

    @keyframes wMove {
      100% {
        background-position: -400px 0;
      }
    } */

.bear {
  position: absolute;
  left: -200px;
  bottom: 25px;
  width: 200px;
  height: 100px;
  background: url(../assets/images/bear.png) no-repeat;
  transform: scale(0.7);
  animation: bear 1s steps(8) infinite, move 5s linear 3s forwards;
}

@keyframes bear {
  to {
    background-position: -1600px 0;
  }
}

@keyframes move {
  0% {
    left: -200px;
  }

  100% {
    left: 50%;
    transform: translateX(-50%) scale(0.7);
  }
}
</style>