// Banco de dados local usando IndexedDB
let db;
const request = indexedDB.open("WhatsAppDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("numeros")) {
        db.createObjectStore("numeros", { keyPath: "numero" });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
};

// Códigos DDDs dos estados do Brasil
const dddsBrasil = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];

// Função para gerar números aleatórios
function gerarNumeros() {
    const quantidade = document.getElementById("quantidade").value;
    const tabelaResultados = document.getElementById("tabelaResultados");
    tabelaResultados.innerHTML = "";

    let numerosGerados = [];

    for (let i = 0; i < quantidade; i++) {
        const ddd = dddsBrasil[Math.floor(Math.random() * dddsBrasil.length)];
        const numero = `${ddd}9${Math.floor(10000000 + Math.random() * 90000000)}`;
        numerosGerados.push(numero);
    }

    numerosGerados.forEach(num => {
        consultarBancoDeDados(num, (status) => {
            const linha = `<tr><td>${num}</td><td id="status-${num}">${status || "❓ Aguardando validação"}</td></tr>`;
            tabelaResultados.innerHTML += linha;

            if (!status) {
                validarComIA(num);
            }
        });
    });
}

// Simulação de IA para validar número
function validarComIA(numero) {
    document.getElementById(`status-${numero}`).textContent = "🔍 Verificando...";

    setTimeout(() => {
        const valido = Math.random() > 0.6; // Simulação de 60% de assertividade da IA
        const status = valido ? "✅ Válido" : "❌ Inválido";
        document.getElementById(`status-${numero}`).textContent = status;

        salvarNoBancoDeDados(numero, status);
    }, 4000);
}

// Salvar número validado no banco de dados
function salvarNoBancoDeDados(numero, status) {
    const transaction = db.transaction(["numeros"], "readwrite");
    const store = transaction.objectStore("numeros");
    store.put({ numero, status });
}

// Consultar número no banco de dados antes de validar
function consultarBancoDeDados(numero, callback) {
    const transaction = db.transaction(["numeros"], "readonly");
    const store = transaction.objectStore("numeros");
    const request = store.get(numero);

    request.onsuccess = function() {
        callback(request.result ? request.result.status : null);
    };
}

// Exportar números validados para CSV
function exportarCSV() {
    let csv = "Número,Status\n";
    const transaction = db.transaction(["numeros"], "readonly");
    const store = transaction.objectStore("numeros");
    const request = store.getAll();

    request.onsuccess = function() {
        request.result.forEach(entry => {
            csv += `${entry.numero},${entry.status}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "numeros_validados.csv";
        link.click();
    };
}
