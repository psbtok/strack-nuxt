<template>
    <div class="cell">
        <slot></slot>
    </div>
</template>
  
  <script>
  export default {
    name: 'TileTemplateComponent'
  }
  </script>
  
  <style scoped>
  .cell {
    box-sizing: border-box;
    border-radius: 16px;
    display: flex;
    padding: 12px;
    justify-content: center;
    align-items: center;
    font-size: 1.25em;
    transition-duration: .3s;
  }
  </style>
  