<template>
  <div class="om-root" :style="boxHeightStyle">
    <div
      class="om-search-container"
      :class="{ 'om-has-focus': isInputFocused }"
      :style="borderColorStyle">
      <button type="button" class="om-search" @click.prevent="triggerSearch">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"></path></svg>
        </slot>
      </button>
      <div
        role="textbox"
        ref="input"
        class="om-input single-line"
        :class="{
          'om-visually-hidden': isPlaceholderVisible,
          'om-width--auto': isInputFocused,
          'om-width--full': !isInputFocused }"
        contenteditable="true"
        @keydown.stop="runSpecialKeys"
        @focusin="isInputFocused = true"
        @focusout="isInputFocused = false">
      </div>
      <span
        v-if="isPlaceholderVisible"
        @click.stop.prevent="focusInput"
        class="om-placeholder"
        aria-hidden="true">{{ placeholder }}</span>
      <div
        v-show="isInputFocused"
        class="om-completion"
        @click.stop.prevent="focusInput">{{ completion }}</div>
    </div>
    <div class="om-list-container">
      <div
        class="om-list"
        :style="`border-color: ${borderColor};`"
        v-if="isOptionsListVisible">
        <div
          v-for="(option, idx) in filteredOptions"
          class="om-list-item"
          :class="{ 'om-highlight': idx === listPosition }"
          :key="option[label] + idx"
          @mousedown.stop.prevent="selectCurrentOption(option)">
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
    borderColor: {
      type: String,
      required: false,
      default: () => 'lightgray'
    },
    boxHeight: {
      type: String,
      required: false,
      default: () => '28px'
    },
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
    focusColor: {
      type: String,
      required: false,
      default: () => 'navy'
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
    },
    value: {
      type: String,
      required: false,
      default: () => ''
    }
  },
  data () {
    return {
      currentSearch: this.value,
      listPosition: -1,
      isOpenList: true,
      isInputFocused: false
    }
  },
  computed: {
    borderColorStyle () {
      return `border-color: ${this.isInputFocused ? this.focusColor : this.borderColor};`
    },
    boxHeightStyle () {
      return `height: ${this.boxHeight};`
    },
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
    },
    isOptionsListVisible () {
      return this.currentSearch.length >= this.minChars && this.showList && this.isOpenList && this.filteredOptions.length > 0 && this.isInputFocused
    },
    isPlaceholderVisible () {
      return (!this.isInputFocused && this.currentSearch.length === 0)
    }
  },
  watch: {
    value () {
      if (this.currentSearch !== this.value) {
        this.currentSearch = this.value
        this.setTextContent(this.value)
        this.focusInput()
      }
    }
  },
  methods: {
    focusInput () {
      const el = this.$refs.input
      if (this.currentSearch !== '') {
        let range = document.createRange()
        let sel = window.getSelection()
        let node = el.childNodes[0]
        range.setStart(node, node.textContent.length)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
      }
      el.focus()
    },
    getTextContent (el = this.$refs.input) {
      return el.textContent
    },
    runSpecialKeys (e) {
      const key = e.key
      if (key === 'Tab' && this.tabCompletion && this.completion !== '') {
        e.preventDefault()
        this.currentSearch += this.completion
        this.setTextContent(this.currentSearch)
        this.focusInput()
      } else if (key === 'ArrowDown' || key === 'Down') {
        e.preventDefault()
        if (this.listPosition < this.filteredOptions.length - 1) {
          this.listPosition += 1
        }
      } else if (key === "ArrowUp" || key === 'Up') {
          e.preventDefault()
          if (this.listPosition > -1) {
            this.listPosition -= 1
          }
      } else if (key === 'Enter') {
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
      el.textContent = value
    },
    triggerSearch () {
      this.$emit('searched', this.currentSearch)
      this.isOpenList = !this.closeOnSelect
    },
    updateValue (e) {
      const content = this.getTextContent()
      if (content !== this.currentSearch) {
        this.currentSearch = content
        this.isOpenList = true
        this.$emit('input', this.currentSearch)
      }
    }
  },
  mounted () {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const onlyTextAdded = Array.prototype.slice.call(mutation.addedNodes).filter(n => n.nodeType !== 3).length === 0
        const onlyTextRemoved = Array.prototype.slice.call(mutation.removedNodes).filter(n => n.nodeType !== 3).length === 0
        const isTextInput = mutation.type === 'characterData' || (onlyTextAdded && onlyTextRemoved)
        if (isTextInput) {
          this.updateValue()
        }
      });
    });

    observer.observe(this.$refs.input, { childList: true, characterData: true, subtree: true })
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
    white-space: pre;
    display: flex;
    align-items: center;
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

  .om-width--auto {
    width: auto;
    float: left;
    min-width: 10px;
  }

  .om-width--full {
    float: left;
    width: 100%;
  }

  .om-placeholder {
    display: block;
    height: 100%;
    width: 100%;
    float: left;
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
    overflow: hidden;
  }

  .om-search-container {
    border: 1px solid lightgray;
    display: flex;
    padding: 4px 8px;
    border-radius: 3px;
  }

  .om-has-focus {
    border: 2px solid navy;
    padding: 3px 7px;
  }

  .om-visually-hidden:not(:focus):not(:active) {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap; /* added line */
  }
</style>
