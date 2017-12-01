@echo off
cd D:\5_WebProgramming\Synth\Components_protos\Modules - Copy\src\styles
attrib -r *.css /s
sass --watch ./:./ --sourcemap=none
cmd /k
pause