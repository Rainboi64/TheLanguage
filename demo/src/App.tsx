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

const theme = createTheme({
  palette: dark,
});

function App() {
  const [src, setSrc] = useState("");

  function ResultBox() {
    const [result, setResult] = useState("");

    useEffect(() => {
      compile();
    });

    async function compile() {
      try {
        setResult(transpile(parse(src).tokens, src).src.join("\n"));
      } catch (e) {
        return "Compilation error";
      }
    }

    return (
      <TextField
        dir="rtl"
        id="outlined-textarea"
        fullWidth
        multiline
        value={result}
        rows={20}
      />
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
