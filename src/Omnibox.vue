<template>
  <div class="om-root">
    <div class="om-search-container">
      <button type="button" class="om-search" @click.prevent="triggerSearch">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"></path></svg>
      </button>
      <div
        ref="input"
        class="om-input single-line"
        :class="{
          'width--auto': this.isInputFocused,
          'width--start': this.isInputFocused && this.currentSearch.length === 0,
          'width--full': !this.isInputFocused && this.currentSearch.length > 0 }"
        contenteditable="true"
        @input.stop="updateValue"
        @keydown.stop="runSpecialKeys"
        @focusin="isInputFocused = true"
        @focusout="isInputFocused = false">
      </div>
      <span
        v-if="this.currentSearch.length === 0 && !this.isInputFocused"
        @click.stop.prevent="focusInput"
        class="om-placeholder">{{ placeholder }}</span>
      <span
        v-show="isInputFocused"
        class="om-completion"
        @click.stop.prevent="focusInput">{{ completion }}</span>
    </div>
    <div class="om-list-container">
      <div class="om-list" v-if="currentSearch.length >= minChars && showList && isOpenList && filteredOptions.length > 0">
        <div
          v-for="(option, idx) in filteredOptions"
          class="om-list-item"
          :class="{ 'om-highlight': idx === listPosition }"
          :key="option[label]"
          @click.stop.prevent="selectCurrentOption(option)">
          <slot name="option" v-bind:option="option">
            {{ option[label] }}
          </slot>
        </div>
    </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    closeOnSelect: {
      type: Boolean,
      required: false,
      default: () => true
    },
    disableSearch: {
      type: Boolean,
      required: false,
      default: () => false
    },
    label: {
      type: String,
      required: false,
      default: () => 'label'
    },
    minChars: {
      type: Number,
      required: false,
      default: () => 3
    },
    options: {
      type: Array,
      required: false,
      default: () => ([])
    },
    placeholder: {
      type: String,
      required: false,
      default: () => 'Search...'
    },
    showList: {
      type: Boolean,
      required: false,
      default: () => true
    },
    tabCompletion: {
      type: Boolean,
      required: false,
      default: () => true
    }
  },
  data () {
    return {
      currentSearch: '',
      listPosition: -1,
      isOpenList: true,
      isInputFocused: false
    }
  },
  computed: {
    completion () {
      const reg = new RegExp(`^(${this.currentSearch})(.+)`, 'i')
      return this.options.reduce((acc, val) => {
        const isMatching = val[this.label].match(reg)
        if (this.currentSearch === '') return ''
        if (acc == '' && isMatching) return isMatching[2]
        if (isMatching && val.length < acc.length) return isMatching[2]
        return acc
      }, '')
    },
    filteredOptions () {
      const reg = new RegExp(`^${this.currentSearch}`, 'i')
      const filtered = this.options.filter(o => o[this.label].match(reg))
      return this.disableSearch ? this.options : filtered
    }
  },
  methods: {
    focusInput () {
      const el = this.$refs.input
      let range = document.createRange()
      let sel = window.getSelection()
      let node = el.childNodes[0]
      range.setStart(node, node.textContent.length)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      el.focus()
    },
    getTextContent (el = this.$refs.input) {
      return [].reduce.call(el.childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, '')
    },
    runSpecialKeys (e) {
      if (e.code === 'Tab' && this.tabCompletion) {
        e.preventDefault()
        this.currentSearch += this.completion
        this.setTextContent(this.currentSearch)
        this.focusInput()
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        if (this.listPosition < this.filteredOptions.length - 1) {
          this.listPosition += 1
        }
      } else if (e.code === "ArrowUp") {
          e.preventDefault()
          if (this.listPosition > -1) {
            this.listPosition -= 1
          }
      } else if (e.code === 'Enter') {
        e.preventDefault()
        if (this.listPosition > -1) {
          this.selectCurrentOption()
        } else {
          this.triggerSearch()
        }
      }
    },
    selectCurrentOption (option = this.filteredOptions[this.listPosition]) {
      this.currentSearch = option[this.label]
      this.setTextContent(this.currentSearch)
      this.listPosition = -1
      this.$emit('selected', option)
      this.isOpenList = !this.closeOnSelect
      this.focusInput()
    },
    setTextContent (value, el = this.$refs.input) {
      el.childNodes[0].textContent = value
    },
    triggerSearch () {
      this.$emit('searched', this.currentSearch)
      this.isOpenList = !this.closeOnSelect
    },
    updateValue (e) {
      const el = e.target
      const content = this.getTextContent(el)
      this.currentSearch = content
      this.isOpenList = true
    }
  },
  mounted () {
    const el = this.$refs.input
    const txt = document.createTextNode('')
    el.prepend(txt)
  }
}
</script>
<style scoped>
  * {
    box-sizing: border-box;
  }
  .om-root {
    position: relative;
  }
  .om-input {
    display: inline-block;
    height: 28px;
    vertical-align: middle;
    line-height: 28px;
  }

  .om-input:focus {
    border: none;
    outline: none;
  }
  .om-completion {
    height: 100%;
    width: auto;
    max-width: 100%;
    color: lightgray;
    overflow: hidden;
    line-height: 28px;
    white-space: pre;
  }
  [contenteditable="true"].single-line {
    white-space: pre;
    overflow: hidden;
  } 
  [contenteditable="true"].single-line br {
    display:none;

  }
  [contenteditable="true"].single-line * {
    display:inline;
    white-space:nowrap;
  }

  .width--auto {
    width: auto;
    max-width: calc(100% - 35px);
  }

  .width--full {
    width: calc(100% - 35px);
  }

  .width--start {
    min-width: 10px;
  }

  .om-placeholder {
    display: inline-block;
    height: 100%;
    width: 100%;
    line-height: 28px;
    color: darkgray;
  }
  .om-list-container {
    position: relative;
  }
  .om-list {
    position: absolute;
    width: 100%;
    border-left: 1px solid lightgray;
    border-right: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    padding: 4px 8px;
    background-color: white;
    z-index: 1001;
  }
  .om-highlight {
    background-color: lightgrey;
  }
  .om-list-item {
    font-weight: 500;
    cursor: pointer;
  }

  .om-list-item:hover {
    background-color: lightgray;
  }

  .om-search {
    vertical-align: middle;
    background-color: transparent;
    border: none;
  }

  .om-search-container {
    border: 1px solid lightgray;
    display: flex;
    padding: 4px 8px;
    border-radius: 3px;
  }
</style>
