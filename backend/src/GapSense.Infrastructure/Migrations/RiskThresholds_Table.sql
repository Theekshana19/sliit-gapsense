-- RiskThresholds table creation script (standalone)
-- Run this script if you need to create the table manually without EF migrations

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RiskThresholds')
BEGIN
    CREATE TABLE [dbo].[RiskThresholds] (
        [Id] uniqueidentifier NOT NULL,
        [RuleName] nvarchar(200) NOT NULL,
        [LowRiskMin] int NOT NULL,
        [MediumRiskMin] int NOT NULL,
        [MediumRiskMax] int NOT NULL,
        [HighRiskMax] int NOT NULL,
        [IsActive] bit NOT NULL,
        [Notes] nvarchar(2000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_RiskThresholds] PRIMARY KEY ([Id])
    );

    CREATE UNIQUE INDEX [IX_RiskThresholds_RuleName] ON [dbo].[RiskThresholds] ([RuleName]);
    CREATE INDEX [IX_RiskThresholds_IsActive] ON [dbo].[RiskThresholds] ([IsActive]);
END
GO
