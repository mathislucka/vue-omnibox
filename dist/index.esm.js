//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  props: {
    closeOnSelect: {
      type: Boolean,
      required: false,
      default: function () { return true; }
    },
    disableSearch: {
      type: Boolean,
      required: false,
      default: function () { return false; }
    },
    label: {
      type: String,
      required: false,
      default: function () { return 'label'; }
    },
    minChars: {
      type: Number,
      required: false,
      default: function () { return 3; }
    },
    options: {
      type: Array,
      required: false,
      default: function () { return ([]); }
    },
    placeholder: {
      type: String,
      required: false,
      default: function () { return 'Search...'; }
    },
    showList: {
      type: Boolean,
      required: false,
      default: function () { return true; }
    },
    tabCompletion: {
      type: Boolean,
      required: false,
      default: function () { return true; }
    }
  },
  data: function data () {
    return {
      currentSearch: '',
      listPosition: -1,
      isOpenList: true,
      isInputFocused: false
    }
  },
  computed: {
    completion: function completion () {
      var this$1 = this;

      var reg = new RegExp(("^(" + (this.currentSearch) + ")(.+)"), 'i');
      return this.options.reduce(function (acc, val) {
        var isMatching = val[this$1.label].match(reg);
        if (this$1.currentSearch === '') { return '' }
        if (acc == '' && isMatching) { return isMatching[2] }
        if (isMatching && val.length < acc.length) { return isMatching[2] }
        return acc
      }, '')
    },
    filteredOptions: function filteredOptions () {
      var this$1 = this;

      var reg = new RegExp(("^" + (this.currentSearch)), 'i');
      var filtered = this.options.filter(function (o) { return o[this$1.label].match(reg); });
      return this.disableSearch ? this.options : filtered
    }
  },
  methods: {
    focusInput: function focusInput () {
      var el = this.$refs.input;
      var range = document.createRange();
      var sel = window.getSelection();
      var node = el.childNodes[0];
      range.setStart(node, node.textContent.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    },
    getTextContent: function getTextContent (el) {
      if ( el === void 0 ) el = this.$refs.input;

      return [].reduce.call(el.childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, '')
    },
    runSpecialKeys: function runSpecialKeys (e) {
      if (e.code === 'Tab' && this.tabCompletion) {
        e.preventDefault();
        this.currentSearch += this.completion;
        this.setTextContent(this.currentSearch);
        this.focusInput();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.listPosition < this.filteredOptions.length - 1) {
          this.listPosition += 1;
        }
      } else if (e.code === "ArrowUp") {
          e.preventDefault();
          if (this.listPosition > -1) {
            this.listPosition -= 1;
          }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (this.listPosition > -1) {
          this.selectCurrentOption();
        } else {
          this.triggerSearch();
        }
      }
    },
    selectCurrentOption: function selectCurrentOption (option) {
      if ( option === void 0 ) option = this.filteredOptions[this.listPosition];

      this.currentSearch = option[this.label];
      this.setTextContent(this.currentSearch);
      this.listPosition = -1;
      this.$emit('selected', option);
      this.isOpenList = !this.closeOnSelect;
      this.focusInput();
    },
    setTextContent: function setTextContent (value, el) {
      if ( el === void 0 ) el = this.$refs.input;

      el.childNodes[0].textContent = value;
    },
    triggerSearch: function triggerSearch () {
      this.$emit('searched', this.currentSearch);
      this.isOpenList = !this.closeOnSelect;
    },
    updateValue: function updateValue (e) {
      var el = e.target;
      var content = this.getTextContent(el);
      this.currentSearch = content;
      this.isOpenList = true;
    }
  },
  mounted: function mounted () {
    var el = this.$refs.input;
    var txt = document.createTextNode('');
    el.prepend(txt);
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "om-root" }, [
    _c("div", { staticClass: "om-search-container" }, [
      _c(
        "button",
        {
          staticClass: "om-search",
          attrs: { type: "button" },
          on: {
            click: function($event) {
              $event.preventDefault();
              return _vm.triggerSearch($event)
            }
          }
        },
        [
          _c(
            "svg",
            {
              attrs: {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 16 16",
                width: "16",
                height: "16"
              }
            },
            [
              _c("path", {
                attrs: {
                  "fill-rule": "evenodd",
                  d:
                    "M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"
                }
              })
            ]
          )
        ]
      ),
      _vm._v(" "),
      _c("div", {
        ref: "input",
        staticClass: "om-input single-line",
        class: {
          "width--auto": this.isInputFocused,
          "width--start":
            this.isInputFocused && this.currentSearch.length === 0,
          "width--full": !this.isInputFocused && this.currentSearch.length > 0
        },
        attrs: { contenteditable: "true" },
        on: {
          input: function($event) {
            $event.stopPropagation();
            return _vm.updateValue($event)
          },
          keydown: function($event) {
            $event.stopPropagation();
            return _vm.runSpecialKeys($event)
          },
          focusin: function($event) {
            _vm.isInputFocused = true;
          },
          focusout: function($event) {
            _vm.isInputFocused = false;
          }
        }
      }),
      _vm._v(" "),
      this.currentSearch.length === 0 && !this.isInputFocused
        ? _c(
            "span",
            {
              staticClass: "om-placeholder",
              on: {
                click: function($event) {
                  $event.stopPropagation();
                  $event.preventDefault();
                  return _vm.focusInput($event)
                }
              }
            },
            [_vm._v(_vm._s(_vm.placeholder))]
          )
        : _vm._e(),
      _vm._v(" "),
      _c(
        "span",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.isInputFocused,
              expression: "isInputFocused"
            }
          ],
          staticClass: "om-completion",
          on: {
            click: function($event) {
              $event.stopPropagation();
              $event.preventDefault();
              return _vm.focusInput($event)
            }
          }
        },
        [_vm._v(_vm._s(_vm.completion))]
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "om-list-container" }, [
      _vm.currentSearch.length >= _vm.minChars &&
      _vm.showList &&
      _vm.isOpenList &&
      _vm.filteredOptions.length > 0
        ? _c(
            "div",
            { staticClass: "om-list" },
            _vm._l(_vm.filteredOptions, function(option, idx) {
              return _c(
                "div",
                {
                  key: option[_vm.label],
                  staticClass: "om-list-item",
                  class: { "om-highlight": idx === _vm.listPosition },
                  on: {
                    click: function($event) {
                      $event.stopPropagation();
                      $event.preventDefault();
                      return _vm.selectCurrentOption(option)
                    }
                  }
                },
                [
                  _vm._t(
                    "option",
                    [
                      _vm._v(
                        "\n          " +
                          _vm._s(option[_vm.label]) +
                          "\n        "
                      )
                    ],
                    { option: option }
                  )
                ],
                2
              )
            }),
            0
          )
        : _vm._e()
    ])
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-99cfac5e_0", { source: "\n*[data-v-99cfac5e] {\n  box-sizing: border-box;\n}\n.om-root[data-v-99cfac5e] {\n  position: relative;\n}\n.om-input[data-v-99cfac5e] {\n  display: inline-block;\n  height: 28px;\n  vertical-align: middle;\n  line-height: 28px;\n}\n.om-input[data-v-99cfac5e]:focus {\n  border: none;\n  outline: none;\n}\n.om-completion[data-v-99cfac5e] {\n  height: 100%;\n  width: auto;\n  max-width: 100%;\n  color: lightgray;\n  overflow: hidden;\n  line-height: 28px;\n  white-space: pre;\n}\n[contenteditable=\"true\"].single-line[data-v-99cfac5e] {\n  white-space: pre;\n  overflow: hidden;\n}\n[contenteditable=\"true\"].single-line br[data-v-99cfac5e] {\n  display:none;\n}\n[contenteditable=\"true\"].single-line *[data-v-99cfac5e] {\n  display:inline;\n  white-space:nowrap;\n}\n.width--auto[data-v-99cfac5e] {\n  width: auto;\n  max-width: calc(100% - 35px);\n}\n.width--full[data-v-99cfac5e] {\n  width: calc(100% - 35px);\n}\n.width--start[data-v-99cfac5e] {\n  min-width: 10px;\n}\n.om-placeholder[data-v-99cfac5e] {\n  display: inline-block;\n  height: 100%;\n  width: 100%;\n  line-height: 28px;\n  color: darkgray;\n}\n.om-list-container[data-v-99cfac5e] {\n  position: relative;\n}\n.om-list[data-v-99cfac5e] {\n  position: absolute;\n  width: 100%;\n  border-left: 1px solid lightgray;\n  border-right: 1px solid lightgray;\n  border-bottom: 1px solid lightgray;\n  padding: 4px 8px;\n  background-color: white;\n  z-index: 1001;\n}\n.om-highlight[data-v-99cfac5e] {\n  background-color: lightgrey;\n}\n.om-list-item[data-v-99cfac5e] {\n  font-weight: 500;\n  cursor: pointer;\n}\n.om-list-item[data-v-99cfac5e]:hover {\n  background-color: lightgray;\n}\n.om-search[data-v-99cfac5e] {\n  vertical-align: middle;\n  background-color: transparent;\n  border: none;\n}\n.om-search-container[data-v-99cfac5e] {\n  border: 1px solid lightgray;\n  display: flex;\n  padding: 4px 8px;\n  border-radius: 3px;\n}\n", map: {"version":3,"sources":["/home/mathis/Development/vue-omnibox/src/Omnibox.vue"],"names":[],"mappings":";AAuLA;EACA,sBAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,qBAAA;EACA,YAAA;EACA,sBAAA;EACA,iBAAA;AACA;AAEA;EACA,YAAA;EACA,aAAA;AACA;AACA;EACA,YAAA;EACA,WAAA;EACA,eAAA;EACA,gBAAA;EACA,gBAAA;EACA,iBAAA;EACA,gBAAA;AACA;AACA;EACA,gBAAA;EACA,gBAAA;AACA;AACA;EACA,YAAA;AAEA;AACA;EACA,cAAA;EACA,kBAAA;AACA;AAEA;EACA,WAAA;EACA,4BAAA;AACA;AAEA;EACA,wBAAA;AACA;AAEA;EACA,eAAA;AACA;AAEA;EACA,qBAAA;EACA,YAAA;EACA,WAAA;EACA,iBAAA;EACA,eAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,kBAAA;EACA,WAAA;EACA,gCAAA;EACA,iCAAA;EACA,kCAAA;EACA,gBAAA;EACA,uBAAA;EACA,aAAA;AACA;AACA;EACA,2BAAA;AACA;AACA;EACA,gBAAA;EACA,eAAA;AACA;AAEA;EACA,2BAAA;AACA;AAEA;EACA,sBAAA;EACA,6BAAA;EACA,YAAA;AACA;AAEA;EACA,2BAAA;EACA,aAAA;EACA,gBAAA;EACA,kBAAA;AACA","file":"Omnibox.vue","sourcesContent":["<template>\n  <div class=\"om-root\">\n    <div class=\"om-search-container\">\n      <button type=\"button\" class=\"om-search\" @click.prevent=\"triggerSearch\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" width=\"16\" height=\"16\"><path fill-rule=\"evenodd\" d=\"M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z\"></path></svg>\n      </button>\n      <div\n        ref=\"input\"\n        class=\"om-input single-line\"\n        :class=\"{\n          'width--auto': this.isInputFocused,\n          'width--start': this.isInputFocused && this.currentSearch.length === 0,\n          'width--full': !this.isInputFocused && this.currentSearch.length > 0 }\"\n        contenteditable=\"true\"\n        @input.stop=\"updateValue\"\n        @keydown.stop=\"runSpecialKeys\"\n        @focusin=\"isInputFocused = true\"\n        @focusout=\"isInputFocused = false\">\n      </div>\n      <span\n        v-if=\"this.currentSearch.length === 0 && !this.isInputFocused\"\n        @click.stop.prevent=\"focusInput\"\n        class=\"om-placeholder\">{{ placeholder }}</span>\n      <span\n        v-show=\"isInputFocused\"\n        class=\"om-completion\"\n        @click.stop.prevent=\"focusInput\">{{ completion }}</span>\n    </div>\n    <div class=\"om-list-container\">\n      <div class=\"om-list\" v-if=\"currentSearch.length >= minChars && showList && isOpenList && filteredOptions.length > 0\">\n        <div\n          v-for=\"(option, idx) in filteredOptions\"\n          class=\"om-list-item\"\n          :class=\"{ 'om-highlight': idx === listPosition }\"\n          :key=\"option[label]\"\n          @click.stop.prevent=\"selectCurrentOption(option)\">\n          <slot name=\"option\" v-bind:option=\"option\">\n            {{ option[label] }}\n          </slot>\n        </div>\n    </div>\n    </div>\n  </div>\n</template>\n<script>\nexport default {\n  props: {\n    closeOnSelect: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    },\n    disableSearch: {\n      type: Boolean,\n      required: false,\n      default: () => false\n    },\n    label: {\n      type: String,\n      required: false,\n      default: () => 'label'\n    },\n    minChars: {\n      type: Number,\n      required: false,\n      default: () => 3\n    },\n    options: {\n      type: Array,\n      required: false,\n      default: () => ([])\n    },\n    placeholder: {\n      type: String,\n      required: false,\n      default: () => 'Search...'\n    },\n    showList: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    },\n    tabCompletion: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    }\n  },\n  data () {\n    return {\n      currentSearch: '',\n      listPosition: -1,\n      isOpenList: true,\n      isInputFocused: false\n    }\n  },\n  computed: {\n    completion () {\n      const reg = new RegExp(`^(${this.currentSearch})(.+)`, 'i')\n      return this.options.reduce((acc, val) => {\n        const isMatching = val[this.label].match(reg)\n        if (this.currentSearch === '') return ''\n        if (acc == '' && isMatching) return isMatching[2]\n        if (isMatching && val.length < acc.length) return isMatching[2]\n        return acc\n      }, '')\n    },\n    filteredOptions () {\n      const reg = new RegExp(`^${this.currentSearch}`, 'i')\n      const filtered = this.options.filter(o => o[this.label].match(reg))\n      return this.disableSearch ? this.options : filtered\n    }\n  },\n  methods: {\n    focusInput () {\n      const el = this.$refs.input\n      let range = document.createRange()\n      let sel = window.getSelection()\n      let node = el.childNodes[0]\n      range.setStart(node, node.textContent.length)\n      range.collapse(true)\n      sel.removeAllRanges()\n      sel.addRange(range)\n      el.focus()\n    },\n    getTextContent (el = this.$refs.input) {\n      return [].reduce.call(el.childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, '')\n    },\n    runSpecialKeys (e) {\n      if (e.code === 'Tab' && this.tabCompletion) {\n        e.preventDefault()\n        this.currentSearch += this.completion\n        this.setTextContent(this.currentSearch)\n        this.focusInput()\n      } else if (e.code === 'ArrowDown') {\n        e.preventDefault()\n        if (this.listPosition < this.filteredOptions.length - 1) {\n          this.listPosition += 1\n        }\n      } else if (e.code === \"ArrowUp\") {\n          e.preventDefault()\n          if (this.listPosition > -1) {\n            this.listPosition -= 1\n          }\n      } else if (e.code === 'Enter') {\n        e.preventDefault()\n        if (this.listPosition > -1) {\n          this.selectCurrentOption()\n        } else {\n          this.triggerSearch()\n        }\n      }\n    },\n    selectCurrentOption (option = this.filteredOptions[this.listPosition]) {\n      this.currentSearch = option[this.label]\n      this.setTextContent(this.currentSearch)\n      this.listPosition = -1\n      this.$emit('selected', option)\n      this.isOpenList = !this.closeOnSelect\n      this.focusInput()\n    },\n    setTextContent (value, el = this.$refs.input) {\n      el.childNodes[0].textContent = value\n    },\n    triggerSearch () {\n      this.$emit('searched', this.currentSearch)\n      this.isOpenList = !this.closeOnSelect\n    },\n    updateValue (e) {\n      const el = e.target\n      const content = this.getTextContent(el)\n      this.currentSearch = content\n      this.isOpenList = true\n    }\n  },\n  mounted () {\n    const el = this.$refs.input\n    const txt = document.createTextNode('')\n    el.prepend(txt)\n  }\n}\n</script>\n<style scoped>\n  * {\n    box-sizing: border-box;\n  }\n  .om-root {\n    position: relative;\n  }\n  .om-input {\n    display: inline-block;\n    height: 28px;\n    vertical-align: middle;\n    line-height: 28px;\n  }\n\n  .om-input:focus {\n    border: none;\n    outline: none;\n  }\n  .om-completion {\n    height: 100%;\n    width: auto;\n    max-width: 100%;\n    color: lightgray;\n    overflow: hidden;\n    line-height: 28px;\n    white-space: pre;\n  }\n  [contenteditable=\"true\"].single-line {\n    white-space: pre;\n    overflow: hidden;\n  } \n  [contenteditable=\"true\"].single-line br {\n    display:none;\n\n  }\n  [contenteditable=\"true\"].single-line * {\n    display:inline;\n    white-space:nowrap;\n  }\n\n  .width--auto {\n    width: auto;\n    max-width: calc(100% - 35px);\n  }\n\n  .width--full {\n    width: calc(100% - 35px);\n  }\n\n  .width--start {\n    min-width: 10px;\n  }\n\n  .om-placeholder {\n    display: inline-block;\n    height: 100%;\n    width: 100%;\n    line-height: 28px;\n    color: darkgray;\n  }\n  .om-list-container {\n    position: relative;\n  }\n  .om-list {\n    position: absolute;\n    width: 100%;\n    border-left: 1px solid lightgray;\n    border-right: 1px solid lightgray;\n    border-bottom: 1px solid lightgray;\n    padding: 4px 8px;\n    background-color: white;\n    z-index: 1001;\n  }\n  .om-highlight {\n    background-color: lightgrey;\n  }\n  .om-list-item {\n    font-weight: 500;\n    cursor: pointer;\n  }\n\n  .om-list-item:hover {\n    background-color: lightgray;\n  }\n\n  .om-search {\n    vertical-align: middle;\n    background-color: transparent;\n    border: none;\n  }\n\n  .om-search-container {\n    border: 1px solid lightgray;\n    display: flex;\n    padding: 4px 8px;\n    border-radius: 3px;\n  }\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-99cfac5e";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Declare install function executed by Vue.use()
function install(Vue) {
	if (install.installed) { return; }
	install.installed = true;
	Vue.component('Omnibox', component);
}

// Create module definition for Vue.use()
var plugin = {
	install: install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };
