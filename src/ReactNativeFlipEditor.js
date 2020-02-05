import React, { useCallback, useRef } from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import WebView from './components/WebView'

import flipEditorScript from './script.json'

const styles = StyleSheet.create({
  webView: {
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'android' ? 24 : 0,
  },
})

const ReactNativeFlipEditor = ({
  updateContent,
  style,
  ...otherProps
 }) => {

  const onMessageEvent = useCallback(
    async event => {
      const data = JSON.parse(event.nativeEvent.data)

      switch(data.identifier) {

        case 'updateContent': {
          const { content } = data.payload
          updateContent && updateContent(content)
        }

      }
    },
    [ updateContent ],
  )

  const post = info => {
    const postIfReady = () => {
      if(!window.isReactNativeWebView) {
        const { origin } = window.location
        parent.postMessage(JSON.stringify(info), origin === 'null' ? '*' : origin)
      } else if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        // send a message to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify(info))
      } else {
        setTimeout(postIfReady, 20)
      }
    }
    postIfReady()
  }

  const source = useRef({
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="user-scalable=0, initial-scale=1, minimum-scale=1, width=device-width, height=device-heightshrink-to-fit=no">
        </head>
        <body style="margin: 0; height: 100vh">

          <div id="flip-editor" style="height: 100%;"></div>

          <script>
            ${flipEditorScript}
          </script>

          <script>
            {

              const post = ${String(post)}

              const editors = [
                {
                  selector: '#flip-editor',
                  props: Object.assign(${JSON.stringify(otherProps)}, {
                    updateContent: content => {
                      post({
                        identifier: 'updateContent',
                        payload: {
                          content,
                        },
                      })
                    },
                  }),
                },
              ]

              editors.forEach(editor => window.FlipEditor(editor))
            }
          </script>

        </body>
      </html>
    `
  }).current

  return (
    <WebView
      style={[
        styles.webView,
        style,
      ]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      source={source}
      onMessage={onMessageEvent}
      // forwardRef={webView}

      // The rest of the props are ignored when on web platform
      // injectedJavaScript={`
      //   window.initialHighlightsObjFromWebView = ${JSON.stringify(initialHighlightsInThisSpine)};
      //   window.isReactNativeWebView = true;
      // `}
      // mixedContentMode="always"
      bounces={false}
    />
  )
}

export default ReactNativeFlipEditor