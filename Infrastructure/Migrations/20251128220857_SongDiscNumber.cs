using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SongDiscNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DiscNumber",
                table: "Songs",
                type: "integer",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DiscNumber", table: "Songs");
        }
    }
}
