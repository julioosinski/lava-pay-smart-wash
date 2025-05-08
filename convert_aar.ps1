# Criar diretório temporário
New-Item -ItemType Directory -Force -Path "temp_aar"

# Copiar arquivo .aar
Copy-Item "Biblioteca (API)\InterfaceAutomacao-v2.1.0.4.aar" -Destination "temp_aar\InterfaceAutomacao.zip"

# Renomear para .zip
Rename-Item "temp_aar\InterfaceAutomacao.zip" "InterfaceAutomacao.zip"

# Extrair o arquivo
Expand-Archive -Path "temp_aar\InterfaceAutomacao.zip" -DestinationPath "temp_aar\extracted" -Force

# Copiar classes.jar para lib
Copy-Item "temp_aar\extracted\classes.jar" -Destination "lib\InterfaceAutomacao.jar" -Force

# Limpar arquivos temporários
Remove-Item -Path "temp_aar" -Recurse -Force

Write-Host "Conversão concluída! O arquivo InterfaceAutomacao.jar foi criado na pasta lib." 