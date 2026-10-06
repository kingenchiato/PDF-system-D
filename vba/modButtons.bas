Option Explicit

Sub ボタン_並べ表()
    Call 並べ表を作る
End Sub

Sub ボタン_請求書()
    Call 請求書を出す
End Sub

Sub ボタン_ラベル()
    Call ラベルを作る
End Sub

' 起動時に計算を手動へはしない。現場は自動のまま。
Sub Auto_Open()
    ' なにもしない。誤って上書きしないため空
End Sub
