import React, { useEffect, useState } from "react";
import "./App.css";
import {
  ThemeProvider,
  createTheme,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import parse from "./thelanguage/parser";
import transpile from "./thelanguage/transpiler";
import { dark } from "@mui/material/styles/createPalette";
import { Message, Token, TokenType } from "./thelanguage/common";

const theme = createTheme({
  palette: dark,
});

function App() {
  const [src, setSrc] = useState("");

  function ResultBox() {
    const [result, setResult] = useState<
      | {
          parser: {
            messages: Message[];
            tokens: Token[];
          };
          transpiler: {
            src: String[];
            messages: Message[];
          };
        }
      | undefined
    >();

    useEffect(() => {
      async function effect() {
        try {
          const parser = parse(src);
          const transpiler = transpile(parser.tokens, src);
          setResult({
            parser: parser,
            transpiler: transpiler,
          });
        } catch (e) {
          console.log(e);
          return;
        }
      }

      effect();
    }, [result, setResult]);

    function getMessages() {
      const parserMessages: Array<string> = [];
      const transpilerMessages: Array<string> = [];

      result?.parser.messages.forEach((message) => {
        parserMessages.push(JSON.stringify(message));
      });

      result?.transpiler.messages.forEach((message) => {
        transpilerMessages.push(JSON.stringify(message));
      });

      return `\n ${parserMessages.join("\n")} \n\n ${transpilerMessages.join(
        "\n"
      )}\n\n TOKENS:\n ${result?.parser.tokens
        .map((element) => {
          return JSON.stringify({
            type: TokenType[element.type],
            line: element.line,
            start: element.start,
            length: element.length,
            lexeme: src.slice(element.start, element.start + element.length),
          });
        })
        .join("\n")}`;
    }

    return (
      <Box display="flex" flexDirection="column" flex={1}>
        <TextField
          dir="rtl"
          id="outlined-textarea"
          fullWidth
          multiline
          disabled
          value={result?.transpiler.src.join("\n")}
          rows={15}
        />
        <TextField
          dir="rtl"
          id="outlined-textarea"
          disabled
          fullWidth
          multiline
          value={getMessages()}
          rows={4}
        />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Typography variant="h2" align="center" color="white">
          اللغة
        </Typography>
        <Box sx={{ display: "flex" }}>
          <ResultBox />
          <Box flex={1}>
            <TextField
              dir="rtl"
              label="اللغة"
              placeholder="اكتب باللغة!"
              rows={20}
              fullWidth
              multiline
              onChange={(e) => {
                setSrc(e.target.value);
              }}
            >
              {src}
            </TextField>
          </Box>
        </Box>
      </div>
      <Typography align="center" dir="rtl" color="white">
        اللغة هي لغة برمجة حديثة متعددة الأستخدامات, يسعى فريق اللغة لتعزيز دور
        اللغة العربية في المجال التقني. قمنا ببناء اللغة بعد البحث في كتب
        الريضيات والمنطق العربية القديمة لأمثال الخوارزمي وغيرهم.
      </Typography>
      <Typography variant="h3" align="center" color="white">
        اكتب سطرك الأول <b>باللغة</b> العربية
      </Typography>
      <Typography
        dir="rtl"
        borderColor="black"
        margin={3}
        border={3}
        variant="h3"
        align="center"
        color="white"
      >
        اطبع "مرحباََ بالعربي!"
      </Typography>

      <Typography
        textAlign={"center"}
        variant="h3"
        align="center"
        color="white"
      >
        عين المجاهيل مثل الخوارزمي
      </Typography>
      <Typography
        dir="rtl"
        textAlign={"center"}
        borderColor="black"
        margin={3}
        border={3}
        variant="h3"
        align="center"
        color="white"
      >
        شيء العربية = "رائع!"
      </Typography>
    </ThemeProvider>
  );
}

export default App;
