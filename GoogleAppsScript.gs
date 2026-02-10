const AUTH_SHEET_NAME = "_UsersAuth_";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action;
    
    // --- MANEJO DE PERFIL/AUTH ---
    if (action === 'signup' || action === 'login' || action === 'update_profile') {
      let authSheet = ss.getSheetByName(AUTH_SHEET_NAME);
      const COLUMNS = [
        "Username", "Password", "CreatedAt", "FullName", "Frutas", "Leches", "Vegetales", 
        "Harinas", "Proteinas", "Grasas", "Calorias", "ExercisePlan", "Indications", 
        "LiquidLiters", "WeightActual", "WeightMeta"
      ];

      if (!authSheet) {
        authSheet = ss.insertSheet(AUTH_SHEET_NAME);
        authSheet.appendRow(COLUMNS);
        authSheet.hideSheet();
      }

      // Check if we need to rebuild the header row
      const currentHeaders = authSheet.getRange(1, 1, 1, authSheet.getLastColumn()).getValues()[0];
      let needsUpdate = false;
      
      // Check if all columns exist and are in the right order
      if (currentHeaders.length !== COLUMNS.length) {
        needsUpdate = true;
      } else {
        for (let i = 0; i < COLUMNS.length; i++) {
          if (currentHeaders[i] !== COLUMNS[i]) {
            needsUpdate = true;
            break;
          }
        }
      }
      
      if (needsUpdate) {
        // Clear and rebuild the header row
        authSheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
      }
      
      const username = data.username.toLowerCase().trim();
      const authData = authSheet.getDataRange().getValues();
      const updatedHeaders = authSheet.getRange(1, 1, 1, authSheet.getLastColumn()).getValues()[0];
      
      let userRow = -1;
      for (let i = 1; i < authData.length; i++) {
        if (authData[i][0].toLowerCase() === username) {
          userRow = i;
          break;
        }
      }
      
      const getColIndex = (name) => updatedHeaders.indexOf(name) + 1;

      if (action === 'signup') {
        if (userRow !== -1) throw new Error("El usuario ya existe");
        const p = data.profile || {};
        const newRow = new Array(updatedHeaders.length).fill("");
        newRow[getColIndex("Username")-1] = username;
        newRow[getColIndex("Password")-1] = data.password;
        newRow[getColIndex("CreatedAt")-1] = new Date().toISOString();
        newRow[getColIndex("FullName")-1] = p.fullName || "";
        newRow[getColIndex("Frutas")-1] = p.goals?.frutas || 0;
        newRow[getColIndex("Leches")-1] = p.goals?.leches || 0;
        newRow[getColIndex("Vegetales")-1] = p.goals?.vegetales || 0;
        newRow[getColIndex("Harinas")-1] = p.goals?.harinas || 0;
        newRow[getColIndex("Proteinas")-1] = p.goals?.proteinas || 0;
        newRow[getColIndex("Grasas")-1] = p.goals?.grasas || 0;
        newRow[getColIndex("Calorias")-1] = p.goals?.calorias || 0;
        newRow[getColIndex("ExercisePlan")-1] = p.exercisePlan || "";
        newRow[getColIndex("Indications")-1] = p.indications || "";
        newRow[getColIndex("LiquidLiters")-1] = p.liquidLiters || 0;
        newRow[getColIndex("WeightActual")-1] = p.weight?.actual || 0;
        newRow[getColIndex("WeightMeta")-1] = p.weight?.meta || 0;
        
        authSheet.appendRow(newRow);
        return createResponse({ status: "success", message: "Usuario creado" });
      }
      
      if (action === 'login') {
        if (userRow === -1) throw new Error("Usuario no encontrado");
        // We need to re-fetch row to ensure we have all columns if they were just added
        const row = authSheet.getRange(userRow + 1, 1, 1, updatedHeaders.length).getValues()[0];
        if (row[updatedHeaders.indexOf("Password")] != data.password) throw new Error("Contraseña incorrecta");
        
        const profile = {
          fullName: row[getColIndex("FullName")-1],
          goals: { 
            frutas: row[getColIndex("Frutas")-1], 
            leches: row[getColIndex("Leches")-1], 
            vegetales: row[getColIndex("Vegetales")-1], 
            harinas: row[getColIndex("Harinas")-1], 
            proteinas: row[getColIndex("Proteinas")-1], 
            grasas: row[getColIndex("Grasas")-1], 
            calorias: row[getColIndex("Calorias")-1] 
          },
          exercisePlan: row[getColIndex("ExercisePlan")-1],
          indications: row[getColIndex("Indications")-1],
          liquidLiters: row[getColIndex("LiquidLiters")-1],
          weight: { 
            actual: row[getColIndex("WeightActual")-1], 
            meta: row[getColIndex("WeightMeta")-1] 
          }
        };
        
        return createResponse({ status: "success", username: username, profile: profile });
      }

      if (action === 'update_profile') {
        if (userRow === -1) throw new Error("Usuario no encontrado");
        const p = data.profile;
        const updates = [];
        const colIndices = [];
        
        const setVal = (name, val) => {
          updates.push(val);
          colIndices.push(getColIndex(name));
        };

        setVal("FullName", p.fullName);
        setVal("Frutas", p.goals.frutas);
        setVal("Leches", p.goals.leches);
        setVal("Vegetales", p.goals.vegetales);
        setVal("Harinas", p.goals.harinas);
        setVal("Proteinas", p.goals.proteinas);
        setVal("Grasas", p.goals.grasas);
        setVal("Calorias", p.goals.calorias);
        setVal("ExercisePlan", p.exercisePlan);
        setVal("Indications", p.indications);
        setVal("LiquidLiters", p.liquidLiters);
        setVal("WeightActual", p.weight.actual);
        setVal("WeightMeta", p.weight.meta);

        // Update each column specifically
        for (let i = 0; i < updates.length; i++) {
          authSheet.getRange(userRow + 1, colIndices[i]).setValue(updates[i]);
        }
        
        return createResponse({ status: "success" });
      }
    }

    // --- MEAL SAVING ---
    if (action === 'save_meal') {
      const username = data.username.toLowerCase();
      const sheetName = username.substring(0, 31).replace(/[\[\]\?\*\/\\\:]/g, '');
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Fecha/Hora", "Plato", "Porción", "Calorías", "Ingredientes", "Harinas", "Vegetales", "Proteínas", "Frutas", "Leches", "Grasas", "Imagen"]);
        sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#22c55e").setFontColor("white");
        sheet.setFrozenRows(1);
      }
      
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.foodName,
        data.portionSize,
        data.estimatedCalories,
        Array.isArray(data.ingredients) ? data.ingredients.join(", ") : data.ingredients,
        data.harinas || 0,
        data.vegetales || 0,
        data.proteinas || 0,
        data.frutas || 0,
        data.leches || 0,
        data.grasas || 0,
        data.image || ""
      ]);
      return createResponse({ status: "success" });
    }

    // --- GET DAILY SUMMARY ---
    if (action === 'get_summary') {
      const username = data.username.toLowerCase();
      const sheetName = username.substring(0, 31).replace(/[\[\]\?\*\/\\\:]/g, '');
      const sheet = ss.getSheetByName(sheetName);
      const summary = { harinas: 0, vegetales: 0, proteinas: 0, frutas: 0, leches: 0, grasas: 0, calorias: 0 };
      
      if (!sheet) return createResponse({ status: "success", summary: summary });
      
      const values = sheet.getDataRange().getValues();
      const today = new Date().toLocaleDateString();
      
      for (let i = 1; i < values.length; i++) {
        const rowDate = new Date(values[i][0]).toLocaleDateString();
        if (rowDate === today) {
          summary.calorias += Number(values[i][3]) || 0;
          summary.harinas += Number(values[i][5]) || 0;
          summary.vegetales += Number(values[i][6]) || 0;
          summary.proteinas += Number(values[i][7]) || 0;
          summary.frutas += Number(values[i][8]) || 0;
          summary.leches += Number(values[i][9]) || 0;
          summary.grasas += Number(values[i][10]) || 0;
        }
      }
      return createResponse({ status: "success", summary: summary });
    }
      
    return createResponse({ status: "error", message: "Acción no reconocida" });

  } catch (error) {
    return createResponse({ status: "error", message: error.toString() });
  }
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
