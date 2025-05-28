/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";
import { LiveClientOptions } from "./types";
import { LiveConnectConfig, Modality } from "@google/genai";

// ===============================
//
// TOOL 定義完可以在這裡添加
//
// ===============================
import {
  Altair,
  declaration as render_altair_declaration,
} from "./components/tools/altair/Altair";

import {
  Weather,
  declaration as render_weather_declaration,
} from "./components/tools/weather/Weather";

// ===============================

// ===============================
//
// 參數設定
//
// ===============================
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (!API_KEY) {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const model = "models/gemini-2.5-flash-preview-native-audio-dialog";
const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
  httpOptions: {
    apiVersion: model.includes("native") ? "v1alpha" : undefined,
  },
};

const defaultConfig: LiveConnectConfig = {
  responseModalities: [Modality.AUDIO],
  speechConfig: {
    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
  },
  systemInstruction: {
    parts: [
      {
        text: 'You are my helpful assistant. Any time I ask you for a graph call the "render_altair" function I have provided you. Dont ask for additional information just make your best judgement.',
      },
    ],
  },
  tools: [
    // there is a free-tier quota for search
    { googleSearch: {} },
    {
      functionDeclarations: [
        render_altair_declaration,
        render_weather_declaration,
      ],
    },
  ],
};
// ===============================

function App() {
  const [config, setConfig] = useState<LiveConnectConfig>({
    ...defaultConfig,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider options={apiOptions} config={config} model={model}>
        <div className="streaming-console">
          <SidePanel />
          <main>
            <div className="main-app-area">
              {/* Tool components */}
              <Altair />
              <Weather />
              {/* End Tool components */}
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={true}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
