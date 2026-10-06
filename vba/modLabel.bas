Option Explicit

' 部材ラベル（並べ明細の1行＝1枚）
' A列=印刷対象。プリンタは「ラベル台」シートの印刷範囲を使う想定

Public Sub ラベルを作る()
    Dim wsN As Worksheet, wsL As Worksheet
    Dim lastR As Long, i As Long, outR As Long
    Dim code As String
    
    On Error GoTo EH
    
    Set wsN = ThisWorkbook.Worksheets("並べ明細")
    Set wsL = ThisWorkbook.Worksheets("ラベル台")
    
    lastR = wsN.Cells(wsN.Rows.Count, 2).End(xlUp).Row
    If lastR < 2 Then
        MsgBox "先に並べ表を作ってください。", vbExclamation
        Exit Sub
    End If
    
    Application.ScreenUpdating = False
    wsL.Range("A2:H4000").ClearContents
    outR = 2
    
    For i = 2 To lastR
        If CStr(wsN.Cells(i, 1).Value) = "特寸" Then
            code = "TOK-" & Format(i, "000")
        Else
            code = "H" & Format(Date, "yymm") & "-" & Format(wsN.Cells(i, 1).Value, "00") & Format(wsN.Cells(i, 2).Value, "000")
        End If
        
        wsL.Cells(outR, 1).Value = code
        wsL.Cells(outR, 2).Value = wsN.Cells(i, 4).Value ' 店舗
        wsL.Cells(outR, 3).Value = wsN.Cells(i, 5).Value
        wsL.Cells(outR, 4).Value = wsN.Cells(i, 6).Value & "x" & wsN.Cells(i, 7).Value
        wsL.Cells(outR, 5).Value = wsN.Cells(i, 11).Value
        wsL.Cells(outR, 6).Value = wsN.Cells(i, 12).Value
        wsL.Cells(outR, 7).Value = wsN.Cells(i, 3).Value
        wsL.Cells(outR, 8).Value = "原板" & wsN.Cells(i, 1).Value
        outR = outR + 1
    Next i
    
    Application.ScreenUpdating = True
    MsgBox (outR - 2) & " 枚分、ラベル台に書きました。" & vbCrLf & _
           "バーコードフォントは本番で組みます（CODE128）。", vbInformation
    wsL.Activate
    Exit Sub
EH:
    Application.ScreenUpdating = True
    MsgBox "ラベルでエラー: " & Err.Description, vbCritical
End Sub

' PDFをAdobeで開いてテキストコピー → 発注一覧へ（暫定）
' 本番は帳票レイアウト確定後に座標指定で取ります
Public Sub PDFから仮取込()
    MsgBox "PDF取込は前回のレイアウト（営業所ヘッダ＋明細）が揃ってから座標を打ちます。" & vbCrLf & _
           "今はCSV/手貼りで発注一覧へ入れて、並べ〜請求まで回してください。", vbInformation
End Sub
